-- init.sql (ejecutar con docker-entrypoint-initdb.d)
-- Crear tablas para Orders con Outbox pattern

-- Tabla principal de órdenes
CREATE TABLE orders (
  sku VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de ítems de orden
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_sku VARCHAR(255) NOT NULL REFERENCES orders(sku) ON DELETE CASCADE,
  product_sku VARCHAR(255) NOT NULL,
  order_item_sku VARCHAR(255),
  unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents >= 0),
  unit_price_currency CHAR(3) NOT NULL CHECK (unit_price_currency ~ '^[A-Z]{3}$'),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(order_sku, product_sku), -- Un producto por orden
  INDEX idx_order_items_order_sku (order_sku),
  INDEX idx_order_items_product_sku (product_sku)
);

-- Outbox para eventos del dominio (Transactional Outbox Pattern)
CREATE TABLE outbox (
  id SERIAL PRIMARY KEY,
  aggregate_sku VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CHECK (aggregate_sku IS NOT NULL),
  CHECK (event_type IN ('OrderCreated', 'ItemAdded', 'OrderCompleted')),
  
  -- Indices optimizados
  INDEX idx_outbox_aggregate_sku (aggregate_sku),
  INDEX idx_outbox_published_at (published_at) WHERE published_at IS NULL, -- Solo eventos pendientes
  INDEX idx_outbox_created_at (created_at),
  INDEX idx_outbox_event_type (event_type)
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION refresh_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION refresh_updated_at_column();
