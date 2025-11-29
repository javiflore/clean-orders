export class OrderId {
  constructor(public readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('OrderId cannot be empty');
    }
  }

  toString() {
    return this.value;
  }
}
