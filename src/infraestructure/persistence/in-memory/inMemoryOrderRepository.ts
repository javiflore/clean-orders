import { err, ok, Result } from '@/src/shared/Result.js';
import { Sku } from '@/src/domain/value-objects/Sku.js';
import { Order } from '@/src/domain/entities/Order.js';
import { OrderRepository } from '@/src/application/ports/OrderRepository.js';
import { AppError, InfraError } from '@/src/application/errors/AppError.js';

export class InMemoryOrderRepository implements OrderRepository {

  private readonly orders = new Map<string, Order>();

  private getKey(id: Sku): string {
    return String(id);
  }

  async save(order: Order): Promise<Result<void, AppError>> {
    try {
        const key = this.getKey(order.getSku as unknown as Sku);
        this.orders.set(key, order);
        return ok(undefined);
    } catch (error) {
        return err(new InfraError('Failed to save order in InMemory repository'));
    }
  }

  async findById(sku: Sku): Promise<Result<Order, AppError>> {
    const key = this.getKey(sku);
    const order = this.orders.get(key);

    if (!order) {
      return err(new InfraError('Order not found in InMemory repository'));
    }

    return ok<Order>(order);
  }

  
}