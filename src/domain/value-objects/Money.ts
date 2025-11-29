import { Currency } from "./Currency.js";

export class Money {

    private readonly _amount: number;
    private readonly _currency: Currency;


  constructor(amount: number, currency: Currency) {
    if (amount < 0 || !Number.isFinite(amount)) {
      throw new Error('Money cents must be a non-negative integer');
    }
    this._amount = Math.round(amount * 100)/100;
    this._currency = currency;
  }

  static fromDecimal(amount: number, currency: Currency): Money {
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      throw new Error('Amount must be a number');
    }
    const cents = Math.round(amount * 100);
    return new Money(cents, currency);
  }

    get amount(): number {
        return this._amount;
    }

    get currency(): Currency {
        return this._currency;
    }

    add(other: Money): Money {
        if (this.currency.code !== other.currency.code) {
            throw new Error('Cannot add Money with different currencies');
        }
        return new Money(this.amount + other.amount, this.currency);
    }

    multiply(factor: number): Money {
        if (!Number.isFinite(factor) || factor < 0) {
            throw new Error('Factor must be a non-negative number');
        }
        return new Money(this.amount * factor, this.currency);
    }   

    equals(other: Money): boolean {
        return this.amount === other.amount && this.currency.code === other.currency.code;
    }

}
