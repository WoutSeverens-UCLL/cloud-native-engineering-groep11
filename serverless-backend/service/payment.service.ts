import { CustomError } from "../model/custom-error";
import { Payment } from "../model/payment";
import { Product } from "../model/product";
import { CosmosPaymentRepository } from "../repository/cosmos-payment-repository";
import { PaymentStatus } from "../types";
import { OrderService } from "./order.service";
import { ProductService } from "./product.service";

export class PaymentService {
  private static instance: PaymentService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new PaymentService();
    }
    return this.instance;
  }

  private async getRepo() {
    return CosmosPaymentRepository.getInstance();
  }

  async createPayment(payment: Payment) {
    const createdPayment = new Payment({
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      firstName: payment.firstName,
      lastName: payment.lastName,
      billingAddress: payment.billingAddress,
      shippingAddress: payment.shippingAddress,
      email: payment.email,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      cardDetails: payment.cardDetails,
    });
    return (await this.getRepo()).createPayment(createdPayment);
  }

  async getAllPayments() {
    return (await this.getRepo()).getAllPayments();
  }

  async getPayment(id: string, orderId: string) {
    if (!id) {
      throw CustomError.invalid("Id is invalid");
    }
    return (await this.getRepo()).getPayment(id, orderId);
  }

  async getPaymentsByOrderId(orderId: string) {
    if (!orderId) {
      throw CustomError.invalid("Order ID is invalid");
    }
    return (await this.getRepo()).getPaymentsByOrderId(orderId);
  }

  async deletePayment(id: string, orderId: string) {
    if (!id) {
      throw CustomError.invalid("Id is invalid");
    }
    return (await this.getRepo()).deletePayment(id, orderId);
  }

  async updatePaymentStatus(
    id: string,
    orderId: string,
    status: PaymentStatus
  ) {
    if (!id || !orderId || !status) {
      throw CustomError.invalid("Id, Order ID or Status is invalid");
    }

    const updatedPayment = await (
      await this.getRepo()
    ).updatePaymentStatus(id, orderId, status);

    if (status === "paid") {
      const orderService = OrderService.getInstance();
      const productService = ProductService.getInstance();

      const productsInOrder = await orderService.getProductsByOrderId(orderId);

      if (!productsInOrder || productsInOrder.length === 0) {
        throw CustomError.notFound("No products found for this order.");
      }

      for (const product of productsInOrder) {
        const { id, productQuantity, sellerId } = product;

        try {
          const existingProduct = await productService.getProduct(id, sellerId);

          // Maak een nieuw object met bijgewerkte voorraad
          const updatedProduct = new Product({
            ...existingProduct,
            stock: existingProduct.stock - productQuantity,
          });

          if (updatedProduct.stock < 0) {
            throw CustomError.invalid(
              `Insufficient stock for product ID: ${id}`
            );
          }

          await productService.updateProduct(id, updatedProduct);
        } catch (error: any) {
          throw CustomError.internal(
            `Failed to update stock for product ID: ${id}. ${error.message}`
          );
        }
      }
    }

    return updatedPayment;
  }
}
