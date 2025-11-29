import { Currency } from "./Currency.js";

export class Money {
  // store in cents to avoid floating point errors
  constructor(public readonly cents: number, public readonly currency: Currency) {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new Error('Money cents must be a non-negative integer');
    }
  }

  static fromDecimal(amount: number, currency: Currency): Money {
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      throw new Error('Amount must be a number');
    }
    const cents = Math.round(amount * 100);
    return new Money(cents, currency);
  }

  add(other: Money): Money {
    if (this.currency.code !== other.currency.code) {
      throw new Error('Cannot add Money with different currencies');
    }
    return new Money(this.cents + other.cents, this.currency);
  }

  multiply(multiplier: number): Money {
    if (!Number.isInteger(multiplier) || multiplier < 0) {
      throw new Error('Multiplier must be a non-negative integer');
    }
    return new Money(this.cents * multiplier, this.currency);
  }

  toDecimal(): number {
    return this.cents / 100;
  }

  equals(other: Money): boolean {
    return this.currency.code === other.currency.code && this.cents === other.cents;
  }

  toString(): string {
    return `${(this.cents / 100).toFixed(2)} ${this.currency.code}`;
  }
}
