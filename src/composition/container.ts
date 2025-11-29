import { EventBus } from "../application/ports/EventBus.js";
import { OrderRepository } from "../application/ports/OrderRepository.js";
import { PricingService } from "../application/ports/PricingService.js";
import { ServerDependencies } from "../application/ports/ServerDependencies.js";
import { AddItemToOrder } from "../application/use-cases/AddItemToOrder.js";
import { CreateOrder } from "../application/use-cases/CreateOrder.js";
import { StaticPricingService } from "../infraestructure/http/StaticPricingService.js";
import { NoopEventBus } from "../infraestructure/messaging/NoopEventBus.js";
import { InMemoryOrderRepository } from "../infraestructure/persistence/in-memory/inMemoryOrderRepository.js";

export interface Dependencies extends ServerDependencies {
    orderRepository: OrderRepository;
    pricingService: PricingService;
    eventBus: EventBus;
}

export function buildContainer(): Dependencies {

    const orderRepository: OrderRepository = new InMemoryOrderRepository();
    const pricingService: PricingService = new StaticPricingService();
    const eventBus: EventBus = new NoopEventBus();

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
        createOrderUseCase,
        addItemToOrderUseCase
    };
}