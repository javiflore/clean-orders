import { ServerDependencies } from "@/src/application/ports/ServerDependencies.js";
import fastify from "fastify";
import { OrdersController } from "./controllers/OrdersController.js";

export async function buildServer(dependencies: ServerDependencies) {
    const server = fastify({
        logger: false
    });

    const orderController = new OrdersController(
        dependencies.createOrderUseCase,
        dependencies.addItemToOrderUseCase,
        dependencies.logger
    );


    await orderController.registerRoutes(server);

    server.get('/health', async (request, reply) => {
        dependencies.logger.info('Health check requested');
        reply.send({ status: 'ok', time: new Date().toISOString() });
    });

    return server;
}