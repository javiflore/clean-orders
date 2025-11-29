import { DomainEvent } from "./DomainEvent.js";

export class ItemAdded extends DomainEvent {

    readonly productSKU: string;
    readonly unitPrice: number;
    readonly quantity: number;
    readonly currency: string;

    constructor(orderSKU: string,
        productSKU: string,
        unitPrice: number,
        quantity: number,
        currency: string
    ) {
        super(orderSKU);
        this.productSKU = productSKU;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.currency = currency;
    }
}

