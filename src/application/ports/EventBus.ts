import { DomainEvent } from "@/src/domain/events/DomainEvent.js";
import { AppError } from "../errors/AppError.js";
import { Result } from "@/src/shared/Result.js";

export interface EventBus {
  publish(events: DomainEvent[]): Promise<Result<void, AppError>>;
}
