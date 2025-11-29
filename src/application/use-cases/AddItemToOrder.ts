
import { Quantity } from '../../domain/value-objects/Quantity.js';
import { Sku } from '../../domain/value-objects/Sku.js';
import { OrderItem } from '../../domain/OrderItem.js';
import { AppError, InfraError, NotFoundError, ValidationError } from '../errors/AppError.js';
import { err, ok, Result } from '@/src/shared/Result.js';
import { OrderRepository } from '../ports/OrderRepository.js';
import { PricingService } from '../ports/PricingService.js';
import { AddItemToOrderDTO } from '../dtos/AddItemToOrderDTO.js';
import { EventBus } from '../ports/EventBus.js';

export type AddItemResult = Result<void, AppError>;

export class AddItemToOrder {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly pricing: PricingService,
    private readonly eventBus: EventBus
) {}

  async execute(dto: AddItemToOrderDTO): Promise<Result<void, AppError>> {

    

    try {

        const orderSku = new Sku(dto.orderSku);
        const productSku = new Sku(dto.productSku);
        const quantity = new Quantity(dto.quantity);

        if (!dto.orderSku || !dto.orderSku) {
            return err(new ValidationError({ fields: ['orderSku', 'productId'] }, 'orderId and productId required'));
        }
        if (!Number.isInteger(dto.quantity) || dto.quantity <= 0) {
            return err(new ValidationError({ field: 'quantity' }, 'quantity must be positive integer'));
        }

        const orderResult = await this.orderRepo.findById(orderSku);
        if (!orderResult.isSuccess) return err(new NotFoundError('Order not found'));


        const order = orderResult.data;

      const priceResult = await this.pricing.getPrice(productSku);
      if (!priceResult.isSuccess) return err(new NotFoundError('Price not found for product SKU'));
        
      const unitPrice = priceResult.data;

      const item = new OrderItem(productSku, unitPrice, quantity, orderSku);

      order.addItem(item);

      await this.orderRepo.save(order);

        const publishResult = await this.eventBus.publish(order.pullEvents());
        if (!publishResult.isSuccess) {
          return err(new InfraError('Failed to publish events'));
        }

      return ok(undefined);
    } catch (e: any) {
      return err(new InfraError(e?.message));
    }
  }
}
