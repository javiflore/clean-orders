// test/domain/Money.spec.ts
import { describe, it, expect } from 'vitest';
import { Money } from '../../src/domain/value-objects/Money.js';
import { Currency } from '../../src/domain/value-objects/Currency.js';

describe('Money', () => {
  const EUR = new Currency('EUR');

  it('crea correctamente con amount y currency', () => {
    const money = new Money(10, EUR);
    expect(money.amount).toBe(10);
    expect(money.currency.code).toBe('EUR');
  });

  it('lanza error con cantidad negativa', () => {
    expect(() => new Money(-1, EUR)).toThrow();
  });

  it('fromDecimal crea Money equivalente', () => {
    const money = Money.fromDecimal(10.25, EUR);
    expect(money.currency.code).toBe('EUR');
    // comprobamos redondeo a 2 decimales
    expect(money.amount).toBeCloseTo(10.25, 2);
  });

  it('add suma cantidades con misma moneda', () => {
    const a = new Money(10, EUR);
    const b = new Money(5, EUR);
    const sum = a.add(b);
    expect(sum.amount).toBeCloseTo(15, 2);
    expect(sum.currency.code).toBe('EUR');
  });

  it('add lanza error si currency distinta', () => {
    const usd = new Currency('USD');
    const a = new Money(10, EUR);
    const b = new Money(5, usd);
    expect(() => a.add(b)).toThrow();
  });

  it('multiply multiplica correctamente', () => {
    const money = new Money(10, EUR);
    const result = money.multiply(2);
    expect(result.amount).toBeCloseTo(20, 2);
  });

  it('equals compara amount y currency', () => {
    const a = new Money(10, EUR);
    const b = new Money(10, EUR);
    const c = new Money(5, EUR);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});