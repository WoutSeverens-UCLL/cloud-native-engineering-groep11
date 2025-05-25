import { CustomError } from "../model/custom-error";
import { Payment } from "../model/payment";
import { CosmosPaymentRepository } from "../repository/cosmos-payment-repository";

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
}
