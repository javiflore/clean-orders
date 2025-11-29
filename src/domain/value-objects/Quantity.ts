export class Quantity {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('Quantity must be a positive integer');
    }
  }
}
