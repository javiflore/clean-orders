import { AppError } from "@/src/application/errors/AppError.js";
import { EventBus } from "@/src/application/ports/EventBus.js";
import { DomainEvent } from "@/src/domain/events/DomainEvent.js";
import { ok, Result } from "@/src/shared/Result.js";

export class NoopEventBus implements EventBus {
  async publish(_events: DomainEvent[]): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}