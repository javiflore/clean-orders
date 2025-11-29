export class ProductId {
  constructor(public readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('ProductId cannot be empty');
    }
  }

  toString() {
    return this.value;
  }
}
