import { Result } from '@/src/shared/Result.js';
import { Order } from '../../domain/entities/Order.js';
import { AppError } from '../errors/AppError.js';
import { Sku } from '@/src/domain/value-objects/Sku.js';

export interface OrderRepository {
  findById(id: Sku): Promise<Result<Order, AppError>>;
  save(order: Order): Promise<Result<void, AppError>>;
}
