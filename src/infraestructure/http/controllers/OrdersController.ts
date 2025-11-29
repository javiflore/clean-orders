import { AddItemToOrderDTO } from "@/src/application/dtos/AddItemToOrderDTO.js";
import { CreateOrderDTO } from "@/src/application/dtos/CreateOrderDTO.js";
import { AppError } from "@/src/application/errors/AppError.js";
import { AddItemToOrder } from "@/src/application/use-cases/AddItemToOrder.js";
import { CreateOrder } from "@/src/application/use-cases/CreateOrder.js";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

interface CreateOrderRequest {
    orderSku: string;
}

interface AddItemRequest {
    productSku: string;
    quantity: number;
}

interface AddItemParams {
    orderSku: string;
}

export class OrdersController {

    constructor(
        private readonly createOrderUseCase: CreateOrder,
        private readonly addItemToOrderUseCase: AddItemToOrder,
    ) {}

    async registerRoutes(fastify: FastifyInstance): Promise<void> {
        fastify.post('/orders', this.createOrder.bind(this));
        fastify.post('/orders/:orderSku/items', this.addItem.bind(this));
    }

    private async createOrder(
        request: FastifyRequest<{ Body: CreateOrderRequest }>,
        reply: FastifyReply
    ): Promise<void> {
        const dto: CreateOrderDTO = {
            orderSku: request.body.orderSku,
        };

        const result = await this.createOrderUseCase.execute(dto);

        if (result.success) {
            reply.status(201).send();
        } else {
            reply.status(400).send({ error: result.error.message });
        }
    }

    private async addItem(
        request: FastifyRequest<{
            Params: AddItemParams;
            Body: AddItemRequest
        }>,
        reply: FastifyReply
    ): Promise<void> {
        const dto: AddItemToOrderDTO = {
            orderSku: request.params.orderSku,
            productSku: request.body.productSku,
            quantity: request.body.quantity,
        };
        const result = await this.addItemToOrderUseCase.execute(dto);

        if (!result.success) {
            const statusCode = this.mapErrorToStatusCode(result.error);
            reply.code(statusCode).send({
                error: result.error.type,
                message: result.error.message
            });
            return
        } 
        reply.status(200).send({message: 'Item added to order successfully'});
    
    }     



        private mapErrorToStatusCode(error: AppError): number {
        switch (error.type) {
            case 'ValidationError':
                return 400;
            case 'NotFoundError':
                return 404;
            case 'ConflictError':
                return 409;
            case 'InfraError':
                return 503;
            default:
                return 500;
        }
    }


}