import { AddItemToOrder } from "../use-cases/AddItemToOrder.js";
import { CreateOrder } from "../use-cases/CreateOrder.js";

export interface ServerDependencies {
    createOrderUseCase: CreateOrder;
    addItemToOrderUseCase: AddItemToOrder;
}