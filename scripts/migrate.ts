// src/scripts/migrate.ts
import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

dotenv.config();

const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'appdb',
  username: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppass',
  ssl: false,
});

async function migrate() {
  console.log('🚀 Iniciando migración...');
  
  try {
    await sql.begin(async (tx) => {
      // 1. Tablas principales
      await tx`
        CREATE TABLE IF NOT EXISTS orders (
          sku VARCHAR(255) PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
      `;

      // 2. Order items (depende de orders)
      await tx`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_sku VARCHAR(255) NOT NULL REFERENCES orders(sku) ON DELETE CASCADE,
          product_sku VARCHAR(255) NOT NULL,
          order_item_sku VARCHAR(255),
          unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents >= 0),
          unit_price_currency CHAR(3) NOT NULL CHECK (unit_price_currency ~ '^[A-Z]{3}$'),
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
        );
      `;

      // 3. Índices de order_items
      await tx`CREATE UNIQUE INDEX IF NOT EXISTS uq_order_product ON order_items(order_sku, product_sku);`;
      await tx`CREATE INDEX IF NOT EXISTS idx_order_items_order_sku ON order_items(order_sku);`;
      await tx`CREATE INDEX IF NOT EXISTS idx_order_items_product_sku ON order_items(product_sku);`;

      // 4. Outbox
      await tx`
        CREATE TABLE IF NOT EXISTS outbox (
          id SERIAL PRIMARY KEY,
          aggregate_sku VARCHAR(255) NOT NULL,
          event_type VARCHAR(100) NOT NULL,
          payload JSONB NOT NULL,
          published_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
          CHECK (event_type IN ('OrderCreated', 'ItemAdded', 'OrderCompleted'))
        );
      `;

      // 5. Índices de outbox
      await tx`CREATE INDEX IF NOT EXISTS idx_outbox_aggregate_sku ON outbox(aggregate_sku);`;
      await tx`CREATE INDEX IF NOT EXISTS idx_outbox_published_at ON outbox(published_at) WHERE published_at IS NULL;`;
      await tx`CREATE INDEX IF NOT EXISTS idx_outbox_created_at ON outbox(created_at);`;
      await tx`CREATE INDEX IF NOT EXISTS idx_outbox_event_type ON outbox(event_type);`;

      // 6. Trigger para updated_at
      await tx`
        CREATE OR REPLACE FUNCTION refresh_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `;

      await tx`
        DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      `;

      await tx`
        CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW EXECUTE FUNCTION refresh_updated_at_column();
      `;
    });

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Ejecutar directamente
migrate().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

export { migrate };
