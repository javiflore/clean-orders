export class Sku {
  constructor(public readonly value: string) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error('Sku cannot be empty');
    }
    // basic pattern: letters/numbers, dashes/underscores allowed
    if (!/^[A-Z0-9-_]+$/i.test(value)) {
      throw new Error('Sku contains invalid characters');
    }
  }

  toString() {
    return this.value;
  }
}
