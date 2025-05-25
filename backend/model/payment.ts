import { PaymentStatus } from "../types";

export class Payment {
  readonly id?: string;
  readonly orderId: string;
  readonly amount: number;
  readonly status: PaymentStatus;
  readonly paymentMethod: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly billingAddress: string;
  readonly shippingAddress: string;
  readonly email: string;
  readonly createdAt: string;
  readonly paidAt?: string;
  readonly cardDetails?: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    cvv?: string;
  };

  constructor(payment: {
    id?: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: string;
    firstName: string;
    lastName: string;
    billingAddress: string;
    shippingAddress: string;
    email: string;
    createdAt: string;
    paidAt?: string;
    cardDetails?: {
      cardNumber?: string;
      cardHolderName?: string;
      expiryDate?: string;
      cvv?: string;
    };
  }) {
    this.validate(payment);
    this.id = payment.id;
    this.orderId = payment.orderId;
    this.amount = payment.amount;
    this.status = payment.status;
    this.paymentMethod = payment.paymentMethod;
    this.firstName = payment.firstName;
    this.lastName = payment.lastName;
    this.billingAddress = payment.billingAddress;
    this.shippingAddress = payment.shippingAddress;
    this.email = payment.email;
    this.createdAt = payment.createdAt;
    this.paidAt = payment.paidAt ?? new Date().toISOString();
    this.cardDetails = payment.cardDetails;
  }

  validate(payment: {
    id?: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: string;
    firstName: string;
    lastName: string;
    billingAddress: string;
    shippingAddress: string;
    email: string;
    createdAt: string;
    paidAt?: string;
    cardDetails?: {
      cardNumber?: string;
      cardHolderName?: string;
      expiryDate?: string;
      cvv?: string;
    };
  }) {
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
    if (payment.firstName && typeof payment.firstName !== "string") {
      throw new Error("Invalid First Name");
    }
    if (payment.lastName && typeof payment.lastName !== "string") {
      throw new Error("Invalid Last Name");
    }
    if (payment.billingAddress && typeof payment.billingAddress !== "string") {
      throw new Error("Invalid Billing Address");
    }
    if (
      payment.shippingAddress &&
      typeof payment.shippingAddress !== "string"
    ) {
      throw new Error("Invalid Shipping Address");
    }
    if (payment.email && typeof payment.email !== "string") {
      throw new Error("Invalid Email");
    }
  }

  equals({
    id,
    orderId,
    amount,
    status,
    paymentMethod,
    firstName,
    lastName,
    billingAddress,
    shippingAddress,
    email,
    createdAt,
    paidAt,
    cardDetails,
  }: {
    id: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: string;
    firstName: string;
    lastName: string;
    billingAddress: string;
    shippingAddress: string;
    email: string;
    createdAt: string;
    paidAt?: string;
    cardDetails?: {
      cardNumber?: string;
      cardHolderName?: string;
      expiryDate?: string;
      cvv?: string;
    };
  }) {
    return (
      this.id === id &&
      this.orderId === orderId &&
      this.amount === amount &&
      this.status === status &&
      this.paymentMethod === paymentMethod &&
      this.firstName === firstName &&
      this.lastName === lastName &&
      this.billingAddress === billingAddress &&
      this.shippingAddress === shippingAddress &&
      this.email === email &&
      this.createdAt === createdAt &&
      this.paidAt === paidAt &&
      JSON.stringify(this.cardDetails) === JSON.stringify(cardDetails)
    );
  }
}
