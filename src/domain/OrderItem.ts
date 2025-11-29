import { Money } from "./value-objects/Money.js";
import { Quantity } from "./value-objects/Quantity.js";
import { Sku } from "./value-objects/Sku.js";


export class OrderItem {
  constructor(
    public readonly productSku: Sku,
    public readonly unitPrice: Money,
    public readonly quantity: Quantity,
    public readonly orderSku: Sku,
  ) {
    // invariants
    if (this.unitPrice.amount < 0) {
      throw new Error('Unit price cannot be negative');
    }
  }

  total(): Money {
    return this.unitPrice.multiply(this.quantity.value);
  }
}
