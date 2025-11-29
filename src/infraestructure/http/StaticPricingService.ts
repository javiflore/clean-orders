import { AppError, InfraError, NotFoundError } from "@/src/application/errors/AppError.js";
import { PricingService } from "@/src/application/ports/PricingService.js";
import { Currency } from "@/src/domain/value-objects/Currency.js";
import { Money } from "@/src/domain/value-objects/Money.js";
import { Sku } from "@/src/domain/value-objects/Sku.js";
import { err, ok, Result } from "@/src/shared/Result.js";

export class StaticPricingService implements PricingService {

    private readonly prices = new Map<string,{currency: string, amount: number}>([
        ['prod-1', { currency: 'EUR', amount: 9.99 }],
        ['prod-2', { currency: 'EUR', amount: 19.5 }],
        ['prod-3', { currency: 'USD', amount: 15 }],
    ]);
  
  async getPrice(productSku: Sku): Promise<Result<Money, AppError>> {
    try {
        const priceData = this.prices.get(productSku.toString());
        if (!priceData) {
            return err(new NotFoundError('Price not found for product SKU'));
        }

        const currency = new Currency(priceData.currency);
        const money = new Money(priceData.amount, currency);

        return ok(money);
    } catch (error) {
        return err(new InfraError());
    }
    
  }
}
