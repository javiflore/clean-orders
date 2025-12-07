import { EventBus } from "../application/ports/EventBus.js";
import { OrderRepository } from "../application/ports/OrderRepository.js";
import { PricingService } from "../application/ports/PricingService.js";
import { ServerDependencies } from "../application/ports/ServerDependencies.js";
import { Logger } from "../application/ports/Logger.js";
import { AddItemToOrder } from "../application/use-cases/AddItemToOrder.js";
import { CreateOrder } from "../application/use-cases/CreateOrder.js";
import { StaticPricingService } from "../infraestructure/http/StaticPricingService.js";
import { NoopEventBus } from "../infraestructure/messaging/NoopEventBus.js";
import { InMemoryOrderRepository } from "../infraestructure/persistence/in-memory/inMemoryOrderRepository.js";
import { PostgresOrderRepository } from "../infraestructure/persistence/postgres/PostgresOrderRepository.js";
import { DatabaseFactory } from "../infraestructure/database/DatabaseFactory.js";
import { MessagingFactory } from "../infraestructure/messaging/MessagingFactory.js";
import { OutboxDispatcher } from "../infraestructure/messaging/OutboxDispatcher.js";
import { PinoLogger } from "../infraestructure/loggin/PinoLogger.js";

export interface Dependencies extends ServerDependencies {
    orderRepository: OrderRepository;
    pricingService: PricingService;
    eventBus: EventBus;
    dispatcher?: OutboxDispatcher;
}

export function buildContainer(): Dependencies {
    const usePostgres = process.env.USE_POSTGRES === 'true';
    
    let orderRepository: OrderRepository;
    let eventBus: EventBus;
    let dispatcher: OutboxDispatcher | undefined;

    if (usePostgres) {
        console.log('🔌 Using PostgreSQL persistence');
        const pool = DatabaseFactory.getPool();
        orderRepository = new PostgresOrderRepository(pool);
        eventBus = MessagingFactory.createEventBus();
        
        // Create dispatcher with default handler that logs events
        dispatcher = MessagingFactory.createOutboxDispatcher(
            async (event) => {
                console.log(`📤 Publishing event: ${event.event_type} [${event.id}]`);
                // TODO: Implement real event publishing (message broker, webhooks, etc.)
            },
            5000, // Poll every 5 seconds
            10    // Batch size
        );
        dispatcher.start();
    } else {
        console.log('💾 Using in-memory persistence');
        orderRepository = new InMemoryOrderRepository();
        eventBus = new NoopEventBus();
    }

    const pricingService: PricingService = new StaticPricingService();
    const logger: Logger = new PinoLogger();

    const createOrderUseCase = new CreateOrder(
        orderRepository,
        eventBus
    );
    const addItemToOrderUseCase = new AddItemToOrder(
        orderRepository,
        pricingService,
        eventBus
    );

    return {
        orderRepository,
        pricingService,
        eventBus,
        logger,
        createOrderUseCase,
        addItemToOrderUseCase,
        dispatcher
    };
}

/**
 * Cleanup resources (database connections, dispatchers, etc.)
 */
export async function cleanupContainer(dependencies: Dependencies): Promise<void> {
    console.log('🧹 Cleaning up resources...');
    
    if (dependencies.dispatcher) {
        dependencies.dispatcher.stop();
    }
    
    await DatabaseFactory.closePool();
    MessagingFactory.reset();
    
    console.log('✅ Cleanup complete');
}