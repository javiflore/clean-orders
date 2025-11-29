
import { Order } from '../../domain/entities/Order.js';
import { EventBus } from '../ports/EventBus.js';
import { AppError, ConflictError, InfraError, ValidationError } from '../errors/AppError.js';
import { OrderRepository } from '../ports/OrderRepository.js';
import { err, ok, Result } from '@/src/shared/Result.js';
import { Sku } from '@/src/domain/value-objects/Sku.js';
import { CreateOrderDTO } from '../dtos/CreateOrderDTO.js';

export type CreateOrderResult = Result<void, AppError>;

export class CreateOrder {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(dto: CreateOrderDTO): Promise<Result<void, AppError>> {
    

    try {
        const order = Order.create(new Sku(dto.orderSku));

        if (!dto.orderSku) {
            return err(new ValidationError({ field: 'orderSku' }, 'orderSku is required'));
        }

        const existing = await this.orderRepo.findById(order.id);
        if (existing) {
            return err(new ConflictError('Order already exists'));
        }

        await this.orderRepo.save(order);
        return ok<void>(undefined);
    } catch (e: any) {
        return err(new InfraError(e?.message));
    }
  }
}
