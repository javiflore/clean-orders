import { EventBus } from '@/src/application/ports/EventBus.js';
import { OutboxEventBus } from './OutboxEventBus.js';
import { NoopEventBus } from './NoopEventBus.js';
import { OutboxDispatcher, EventHandler } from './OutboxDispatcher.js';
import { DatabaseFactory } from '../database/DatabaseFactory.js';

export class MessagingFactory {
    private static eventBusInstance: EventBus | null = null;
    private static outboxDispatcherInstance: OutboxDispatcher | null = null;

    /**
     * Crea EventBus usando OutboxEventBus con el Pool de DatabaseFactory.
     */
    static createEventBus(): EventBus {
        if (!this.eventBusInstance) {
            const pool = DatabaseFactory.getPool();
            this.eventBusInstance = new OutboxEventBus(pool);
        }
        return this.eventBusInstance;
    }

    /**
     * Crea EventBus sin persistencia (para testing).
     */
    static createNoopEventBus(): EventBus {
        return new NoopEventBus();
    }

    /**
     * Crea OutboxDispatcher con el Pool de DatabaseFactory.
     */
    static createOutboxDispatcher(
        eventHandler: EventHandler,
        pollIntervalMs: number = 5000,
        batchSize: number = 10
    ): OutboxDispatcher {
        if (!this.outboxDispatcherInstance) {
            const pool = DatabaseFactory.getPool();
            this.outboxDispatcherInstance = new OutboxDispatcher(
                pool,
                eventHandler,
                pollIntervalMs,
                batchSize
            );
        }
        return this.outboxDispatcherInstance;
    }

    static reset(): void {
        this.eventBusInstance = null;
        this.outboxDispatcherInstance = null;
    }
}