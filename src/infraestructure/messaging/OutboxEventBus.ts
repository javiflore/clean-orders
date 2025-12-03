import { Pool, PoolClient } from "pg";
import { EventBus } from "@/src/application/ports/EventBus.js";
import { DomainEvent } from "@/src/domain/events/DomainEvent.js";
import { Result, ok, err } from "@/src/shared/Result.js";
import { InfraError } from "@/src/application/errors/AppError.js";

/**
 * EventBus que persiste eventos en la tabla outbox.
 * Soporta transacciones mediante PoolClient.
 */
export class OutboxEventBus implements EventBus {
  constructor(private readonly dbClient: Pool | PoolClient) {}

  async publish(events: DomainEvent[]): Promise<Result<void, InfraError>> {
    if (events.length === 0) {
      return ok(undefined);
    }
    

    try {
      const query = `
        INSERT INTO outbox (aggregate_sku, event_type, payload, created_at)
        VALUES ($1, $2, $3, NOW())
      `;

      for (const event of events) {
        const eventType = event.constructor.name;
        const payload = JSON.stringify({
          ...event,
          eventType,
        });

        await this.dbClient.query(query, [
          event.agregateId,
          eventType,
          payload,
        ]);
      }

      return ok(undefined);
    } catch (error) {
      return err(
        new InfraError(
          `Failed to publish events to outbox: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
    }
  }
}
