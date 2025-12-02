import { Pool, PoolClient } from 'pg';
import { Order } from '../../../domain/entities/Order.js';
import { OrderItem } from '../../../domain/value-objects/OrderItem.js';
import { OrderRepository } from '../../../application/ports/OrderRepository.js';
import { Result, ok, err } from '@/src/shared/Result.js';
import { AppError, InfraError, NotFoundError } from '../../../application/errors/AppError.js';
import { Sku } from '../../../domain/value-objects/Sku.js';
import { Money } from '../../../domain/value-objects/Money.js';
import { Quantity } from '../../../domain/value-objects/Quantity.js';
import { Currency } from '../../../domain/value-objects/Currency.js';

export class PostgresOrderRepository implements OrderRepository {
    private pool: Pool | PoolClient;

    constructor(poolOrClient: Pool | PoolClient) {
        this.pool = poolOrClient;
    }

    async save(order: Order): Promise<Result<void, AppError>> {
        // Si es un PoolClient, ya está dentro de una transacción, usarlo directamente
        const isPoolClient = 'release' in this.pool && typeof (this.pool as any).release === 'function';
        const client = isPoolClient ? (this.pool as PoolClient) : await (this.pool as Pool).connect();
        const shouldManageTransaction = !isPoolClient;
        
        try {
            if (shouldManageTransaction) {
                await client.query('BEGIN');
            }

            const orderSku = order.getSku().toString();

            // Upsert order
            await client.query(
                `INSERT INTO orders (sku, created_at, updated_at)
                 VALUES ($1, NOW(), NOW())
                 ON CONFLICT (sku) 
                 DO UPDATE SET updated_at = NOW()`,
                [orderSku]
            );

            // Delete existing order items for re-insert (simpler for now)
            await client.query('DELETE FROM order_items WHERE order_sku = $1', [orderSku]);

            // Insert new order items
            const items = order.getItems();
            for (const item of items) {
                await client.query(
                    `INSERT INTO order_items (
                        order_sku, 
                        product_sku, 
                        unit_price_cents, 
                        unit_price_currency, 
                        quantity,
                        created_at
                    )
                    VALUES ($1, $2, $3, $4, $5, NOW())`,
                    [
                        orderSku,
                        item.productSku.toString(),
                        Math.round(item.unitPrice.amount * 100), // convert to cents
                        item.unitPrice.currency.code,
                        item.quantity.value
                    ]
                );
            }

            await client.query('COMMIT');
            return ok(undefined);
        } catch (error: any) {
            if (shouldManageTransaction) {
                await client.query('ROLLBACK');
            }
            return err(new InfraError(error?.message || 'Failed to save order'));
        } finally {
            if (shouldManageTransaction && !isPoolClient) {
                (client as PoolClient).release();
            }
        }
    }

    async findById(id: Sku): Promise<Result<Order, AppError>> {
        try {
            const sku = id.toString();
            
            const orderResult = await this.pool.query(
                'SELECT * FROM orders WHERE sku = $1',
                [sku]
            );

            if (orderResult.rows.length === 0) {
                return err(new NotFoundError(`Order with SKU ${sku} not found`));
            }

            const itemsResult = await this.pool.query(
                `SELECT * FROM order_items WHERE order_sku = $1 ORDER BY id`,
                [sku]
            );

            const order = Order.create(id);

            // Reconstruct items
            for (const row of itemsResult.rows) {
                const productSku = new Sku(row.product_sku);
                const currency = new Currency(row.unit_price_currency);
                const amount = row.unit_price_cents / 100; // convert from cents
                const unitPrice = new Money(amount, currency);
                const quantity = new Quantity(row.quantity);

                const item = new OrderItem(productSku, unitPrice, quantity, id);
                order.addItem(item);
            }

            return ok(order);
        } catch (error: any) {
            return err(new InfraError(error?.message || 'Failed to find order'));
        }
    }
}