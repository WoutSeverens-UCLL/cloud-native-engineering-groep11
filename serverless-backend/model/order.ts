import { OrderStatus } from "../types";
import { Product } from "./product";

export class Order {
  readonly id?: string;
  readonly products: Product[];
  readonly sellerId: string;
  readonly buyerId: string;
  readonly quantity: number;
  readonly totalAmount: number;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly updatedAt?: string;

  constructor(order: {
    id?: string;
    products: Product[];
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
    this.products = order.products;
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
    products: Product[];
    sellerId: string;
    buyerId: string;
    quantity: number;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt?: string;
  }) {
    if (
      !order.products ||
      !Array.isArray(order.products) ||
      order.products.length === 0
    ) {
      throw new Error("Invalid Products");
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
    products,
    sellerId,
    buyerId,
    quantity,
    totalAmount,
    status,
    createdAt,
    updatedAt,
  }: {
    id?: string;
    products: Product[];
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
      this.products.length === products.length &&
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
