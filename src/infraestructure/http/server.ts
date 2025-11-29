import { ServerDependencies } from "@/src/application/ports/ServerDependencies.js";
import fastify from "fastify";
import { OrdersController } from "./controllers/OrdersController.js";

export async function buildServer(dpendencies: ServerDependencies) {
    const server = fastify({
        logger: true
    });

    const orderController = new OrdersController(
        dpendencies.createOrderUseCase,
        dpendencies.addItemToOrderUseCase
    );


    await orderController.registerRoutes(server);

    server.get('/health', async (request, reply) => {
        reply.send({ status: 'ok', time: new Date().toISOString() });
    });

    return server;
}