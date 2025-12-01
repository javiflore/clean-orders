import { describe, it, expect } from 'vitest';
import { Order } from '../../src/domain/entities/Order.js';
import { OrderItem } from '../../src/domain/value-objects/OrderItem.js';
import { Sku } from '../../src/domain/value-objects/Sku.js';
import { Quantity } from '../../src/domain/value-objects/Quantity.js';
import { Money } from '../../src/domain/value-objects/Money.js';
import { Currency } from '../../src/domain/value-objects/Currency.js';
import { OrderCreated } from '../../src/domain/events/OrderCreated.js';
import { ItemAdded } from '../../src/domain/events/ItemAdded.js';

describe('Order', () => {
  const EUR = new Currency('EUR');

  function makeItem(productSku: string, price: number, quantity: number, orderSku: string) {
    return new OrderItem(
      new Sku(productSku),
      new Money(price, EUR),
      new Quantity(quantity),
      new Sku(orderSku),
    );
  }

  it('create genera Order y registra OrderCreated', () => {
    const sku = new Sku('order-1');
    const order = Order.create(sku);

    expect(order.getSku().toString()).toBe('order-1');

    const events = order.pullEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    const hasOrderCreated = events.some((e) => e instanceof OrderCreated);
    expect(hasOrderCreated).toBe(true);
  });

  it('addItem añade item y registra ItemAdded', () => {
    const sku = new Sku('order-1');
    const order = new Order(sku);
    const item = makeItem('prod-1', 10, 2, 'order-1');

    order.addItem(item);

    const items = order.getItems();
    expect(items).toHaveLength(1);

    const events = order.pullEvents();
    const hasItemAdded = events.some((e) => e instanceof ItemAdded);
    expect(hasItemAdded).toBe(true);
  });

  it('totalsByCurrency agrupa por currency', () => {
    const sku = new Sku('order-1');
    const order = new Order(sku);

    order.addItem(makeItem('prod-1', 10, 2, 'order-1')); // 20 EUR
    order.addItem(makeItem('prod-2', 5, 1, 'order-1'));  // 5 EUR

    const totals = order.totalsByCurrency();
    expect(Object.keys(totals)).toEqual(['EUR']);
    expect(totals['EUR'].amount).toBeCloseTo(25, 2);
  });
});