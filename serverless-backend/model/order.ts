import { OrderStatus } from "../types";

export class Order {
  readonly id?: string;
  readonly productId: string;
  readonly sellerId: string;
  readonly buyerId: string;
  readonly quantity: number;
  readonly totalAmount: number;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly updatedAt?: string;

  constructor(order: {
    id?: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    quantity: number;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt?: string;
  }) {
    this.validate(order);
    this.id = order.id;
    this.productId = order.productId;
    this.sellerId = order.sellerId;
    this.buyerId = order.buyerId;
    this.quantity = order.quantity;
    this.totalAmount = order.totalAmount;
    this.status = order.status;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt ?? new Date().toISOString();
  }

  validate(order: {
    id?: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    quantity: number;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt?: string;
  }) {
    if (!order.productId || typeof order.productId !== "string") {
      throw new Error("Invalid Product ID");
    }
    if (!order.sellerId || typeof order.sellerId !== "string") {
      throw new Error("Invalid Seller ID");
    }
    if (!order.buyerId || typeof order.buyerId !== "string") {
      throw new Error("Invalid Buyer ID");
    }
    if (typeof order.quantity !== "number" || order.quantity <= 0) {
      throw new Error("Invalid Quantity");
    }
    if (typeof order.totalAmount !== "number" || order.totalAmount <= 0) {
      throw new Error("Invalid Total Amount");
    }
  }

  equals({
    id,
    productId,
    sellerId,
    buyerId,
    quantity,
    totalAmount,
    status,
    createdAt,
    updatedAt,
  }: {
    id?: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    quantity: number;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt?: string;
  }) {
    return (
      this.id === id &&
      this.productId === productId &&
      this.sellerId === sellerId &&
      this.buyerId === buyerId &&
      this.quantity === quantity &&
      this.totalAmount === totalAmount &&
      this.status === status &&
      this.createdAt === createdAt &&
      this.updatedAt === updatedAt
    );
  }
}
