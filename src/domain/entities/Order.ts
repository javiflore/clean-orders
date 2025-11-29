import { OrderId } from '../value-objects/OrderId.js';
import { OrderItem } from '../OrderItem.js';
import { Money } from '../value-objects/Money.js';
import { Sku } from '../value-objects/Sku.js';

export class Order {
  private items: OrderItem[] = [];
  private events: any[] = [];

  private constructor(public readonly id: OrderId, public readonly createdAt: string = new Date().toISOString()) {}

  static create(id: Sku): Order {
    const order = new Order(id);
    order.recordEvent(makeOrderCreated(id.toString()));
    return order;
  }

  addItem(item: OrderItem): void {
    this.items.push(item);
    this.recordEvent(
      makeItemAdded({
        orderId: this.id.toString(),
        productId: item.productSku.toString(),
        sku: item.orderSku ? item.orderSku.toString() : undefined,
        unitPrice: { cents: item.unitPrice.cents, currency: item.unitPrice.currency.code },
        quantity: item.quantity.value,
      }),
    );
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
function makeOrderCreated(arg0: string): any {
  throw new Error('Function not implemented.');
}

function makeItemAdded(arg0: { orderId: string; productId: any; sku: any; unitPrice: { cents: any; currency: any; }; quantity: any; }): any {
  throw new Error('Function not implemented.');
}

