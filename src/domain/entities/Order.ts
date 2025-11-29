import { OrderId } from '../value-objects/OrderId.js';
import { OrderItem } from '../OrderItem.js';
import { Money } from '../value-objects/Money.js';
import { Sku } from '../value-objects/Sku.js';
import { DomainEvent } from '../events/DomainEvent.js';
import { OrderCreated } from '../events/OrderCreated.js';
import { ItemAdded } from '../events/ItemAdded.js';

export class Order {
  private sku: Sku;
  private items: OrderItem[] = [];
  private events: DomainEvent[] = [];

  constructor(
    sku: Sku
  ) {
    this.sku = sku;
    this.events.push(new OrderCreated(sku.toString()));
  }

  static create(id: Sku): Order {
    const order = new Order(id);
    order.recordEvent(new OrderCreated(id.toString()));
    return order;
  }

  addItem(item: OrderItem): void {
    this.items.push(item);
    this.recordEvent(
      new ItemAdded(
      this.sku.toString(),
      item.productSku.toString(), 
      item.unitPrice.amount,
      item.quantity.value, 
      item.unitPrice.currency.code 
    ),
    );
  }

  getSku(): Sku {
    return this.sku;
  }

  getItems(): ReadonlyArray<OrderItem> {
    return this.items.slice();
  }

  totalsByCurrency(): Record<string, Money> {
    const totals: Record<string, Money> = {};
    for (const item of this.items) {
      const currency = item.unitPrice.currency.code;
      const itemTotal = item.total();
      const existing = totals[currency];
      if (existing) {
        totals[currency] = existing.add(itemTotal);
      } else {
        totals[currency] = itemTotal;
      }
    }
    return totals;
  }

  pullEvents(): any[] {
    const ev = this.events.slice();
    this.events = [];
    return ev;
  }

  private recordEvent(e: any) {
    this.events.push(e);
  }
}
 

