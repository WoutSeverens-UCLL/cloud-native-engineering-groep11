import { PaymentStatus } from "../types";

export class Payment {
  readonly id?: string;
  readonly orderId: string;
  readonly amount: number;
  readonly status: PaymentStatus;
  readonly paymentMethod: string;
  readonly createdAt: string;
  readonly paidAt?: string;

  constructor(payment: {
    id?: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: string;
    createdAt: string;
    paidAt?: string;
  }) {
    this.validate(payment);
    this.id = payment.id;
    this.orderId = payment.orderId;
    this.amount = payment.amount;
    this.status = payment.status;
    this.paymentMethod = payment.paymentMethod;
    this.createdAt = payment.createdAt;
    this.paidAt = payment.paidAt ?? new Date().toISOString();
  }

  validate(payment: {
    id?: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: string;
    createdAt: string;
    paidAt?: string;
  }) {
    if (!payment.id || typeof payment.id !== "string") {
      throw new Error("Invalid ID");
    }
    if (!payment.orderId || typeof payment.orderId !== "string") {
      throw new Error("Invalid Order ID");
    }
    if (typeof payment.amount !== "number" || payment.amount <= 0) {
      throw new Error("Invalid Amount");
    }
    if (!payment.status || typeof payment.status !== "string") {
      throw new Error("Invalid Status");
    }
    if (!payment.paymentMethod || typeof payment.paymentMethod !== "string") {
      throw new Error("Invalid Payment Method");
    }
  }

  equals({
    id,
    orderId,
    amount,
    status,
    paymentMethod,
    createdAt,
    paidAt,
  }: {
    id: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: string;
    createdAt: string;
    paidAt?: string;
  }) {
    return (
      this.id === id &&
      this.orderId === orderId &&
      this.amount === amount &&
      this.status === status &&
      this.paymentMethod === paymentMethod &&
      this.createdAt === createdAt &&
      this.paidAt === paidAt
    );
  }
}
