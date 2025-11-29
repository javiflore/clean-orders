export class Currency {
  private static readonly ALLOWED = new Set(['USD', 'EUR', 'GBP']);

  constructor(public readonly code: string) {
    if (!Currency.isValid(code)) {
      throw new Error(
        `Invalid currency code: ${code}. Allowed: ${Array.from(Currency.ALLOWED).join(', ')}`,
      );
    }
  }

  static isValid(code: string): boolean {
    return typeof code === 'string' && Currency.ALLOWED.has(code);
  }

  toString() {
    return this.code;
  }
}
