import { Sku } from '@/src/domain/value-objects/Sku.js';
import { Money } from '../../domain/value-objects/Money.js';
import { AppError } from '../errors/AppError.js';
import { Result } from '@/src/shared/Result.js';

export interface PricingService {
  getPrice(productSku: Sku): Promise<Result<Money, AppError>>;
}
