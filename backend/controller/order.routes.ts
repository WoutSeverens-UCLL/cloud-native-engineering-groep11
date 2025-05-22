import { Router, Request, Response, NextFunction } from "express";
import { OrderService } from "../service/order.service";
import { Order } from "../model/order";
import { OrderStatus } from "../types";

const orderRouter = Router();

orderRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await OrderService.getInstance().getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.get(
  "/user/:role/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role, userId } = req.params;
      let orders;

      if (role === "buyer") {
        orders = await OrderService.getInstance().getOrdersByBuyerId(userId);
      } else if (role === "seller") {
        orders = await OrderService.getInstance().getOrdersBySellerId(userId);
      } else {
        res.status(400).json({ message: "Invalid role" });
        return;
      }

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.get(
  "/product/:productId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await OrderService.getInstance().getOrdersByProductId(
        req.params.productId
      );
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.get(
  "/:id/:buyerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await OrderService.getInstance().getOrder(
        req.params.id,
        req.params.buyerId
      );
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = new Order(req.body);
      const createdOrder = await OrderService.getInstance().createOrder(order);
      res.status(201).json(createdOrder);
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.delete(
  "/:id/:buyerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await OrderService.getInstance().deleteOrder(
        req.params.id,
        req.params.buyerId
      );
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
);

orderRouter.patch(
  "/:id/:buyerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, buyerId } = req.params;
      const { status } = req.body as { status: OrderStatus };

      const updatedOrder = await OrderService.getInstance().updateOrderStatus(
        id,
        buyerId,
        status
      );
      res.status(200).json(updatedOrder);
    } catch (error) {
      next(error);
    }
  }
);
export { orderRouter };
