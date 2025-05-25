import { Router, Response, Request, NextFunction } from "express";
import { PaymentService } from "../service/payment.service";
import { Payment } from "../model/payment";

const paymentRouter = Router();

paymentRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await PaymentService.getInstance().getAllPayments();
      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }
);

paymentRouter.get(
  "/detail/:id/:orderId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await PaymentService.getInstance().getPayment(
        req.params.id,
        req.params.orderId
      );
      res.status(200).json(payment);
    } catch (error) {
      next(error);
    }
  }
);

paymentRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = new Payment(req.body);
      const createdPayment = await PaymentService.getInstance().createPayment(
        payment
      );
      res.status(201).json(createdPayment);
    } catch (error) {
      next(error);
    }
  }
);

paymentRouter.get(
  "/order/:orderId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await PaymentService.getInstance().getPaymentsByOrderId(
        req.params.orderId
      );
      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }
);

paymentRouter.delete(
  "/:id/:orderId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PaymentService.getInstance().deletePayment(
        req.params.id,
        req.params.orderId
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

paymentRouter.patch(
  "/:id/:orderId/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const updatedPayment =
        await PaymentService.getInstance().updatePaymentStatus(
          req.params.id,
          req.params.orderId,
          status
        );
      res.status(200).json(updatedPayment);
    } catch (error) {
      next(error);
    }
  }
);

export { paymentRouter };
