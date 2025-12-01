import { describe, it, expect } from 'vitest';
import { AddItemToOrder } from '../../src/application/use-cases/AddItemToOrder.js';
import { InMemoryOrderRepository } from '../../src/infraestructure/persistence/in-memory/InMemoryOrderRepository.js';
import { StaticPricingService } from '../../src/infraestructure/http/StaticPricingService.js';
import { NoopEventBus } from '../../src/infraestructure/messaging/NoopEventBus.js';
import { Order } from '../../src/domain/entities/Order.js';
import { Sku } from '../../src/domain/value-objects/Sku.js';
import { isOk, isErr } from '../../src/shared/Result.js';

describe('AddItemToOrder (acceptance)', () => {
  it('añade un item a la orden existente usando adaptadores en memoria', async () => {
    const orderRepo = new InMemoryOrderRepository();
    const pricing = new StaticPricingService();
    const eventBus = new NoopEventBus();

    const existingOrder = Order.create(new Sku('order-1'));
    orderRepo.seed(existingOrder);

    const useCase = new AddItemToOrder(orderRepo, pricing, eventBus);

    const result = await useCase.execute({
      orderSku: 'order-1',
      productSku: 'prod-1',
      quantity: 2,
    });

    expect(isOk(result)).toBe(true);

    const afterResult = await orderRepo.findById(new Sku('order-1'));
    expect(isOk(afterResult)).toBe(true);
    if (isOk(afterResult)) {
      const order = afterResult.data as Order;
      const items = order.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].quantity.value).toBe(2);
      expect(items[0].unitPrice.amount).toBe(10);
    }
  });

  it('falla si la orden no existe', async () => {
    const orderRepo = new InMemoryOrderRepository();
    const pricing = new StaticPricingService();
    const eventBus = new NoopEventBus();

    const useCase = new AddItemToOrder(orderRepo, pricing, eventBus);

    const result = await useCase.execute({
      orderSku: 'unknown',
      productSku: 'prod-1',
      quantity: 1,
    });

    expect(isErr(result)).toBe(true);
  });
});