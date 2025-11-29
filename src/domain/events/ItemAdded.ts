import { DomainEvent } from "./DomainEvent.js";

export class ItemAddedToOrder extends DomainEvent {

    readonly productSKU: string;
    readonly unitPrice: { cents: number; currency: string };
    readonly quantity: number;
    readonly currency: string;

    constructor(orderSKU: string,
        productSKU: string,
        unitPriceCents: number,
        quantity: number,
        currency: string
    ) {
        super(orderSKU);
        this.productSKU = productSKU;
        this.unitPrice = { cents: unitPriceCents, currency };
        this.quantity = quantity;
        this.currency = currency;
    }
}

