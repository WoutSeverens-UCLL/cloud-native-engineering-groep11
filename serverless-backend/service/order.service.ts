import { CustomError } from "../model/custom-error";
import { Order } from "../model/order";
import { CosmosOrderRepository } from "../repository/cosmos-order-repository";
import { OrderStatus } from "../types";

export class OrderService {
  private static instance: OrderService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new OrderService();
    }
    return this.instance;
  }

  private async getRepo() {
    return CosmosOrderRepository.getInstance();
  }

  async createOrder(order: Order) {
    const createdOrder = new Order({
      products: order.products,
      sellerId: order.sellerId,
      buyerId: order.buyerId,
      orderQuantity: order.orderQuantity,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
    return (await this.getRepo()).createOrder(createdOrder);
  }

  async getAllOrders() {
    return (await this.getRepo()).getAllOrders();
  }

  async getProductsByOrderId(orderId: string) {
    if (!orderId) {
      throw CustomError.invalid("Order ID is invalid");
    }
    return (await this.getRepo()).getProductsByOrderId(orderId);
  }

  async getOrder(id: string, buyerId: string) {
    if (!id) {
      throw CustomError.invalid("Id is invalid");
    }
    return (await this.getRepo()).getOrder(id, buyerId);
  }

  async getPartitionKeyForOrder(orderId: string) {
    if (!orderId) {
      throw CustomError.invalid("Order ID is invalid");
    }
    return (await this.getRepo()).getPartitionKeyForOrder(orderId);
  }

  async getOrdersByBuyerId(buyerId: string) {
    if (!buyerId) {
      throw CustomError.invalid("Buyer ID is invalid");
    }
    return (await this.getRepo()).getOrdersByBuyerId(buyerId);
  }

  async getOrdersBySellerId(sellerId: string) {
    if (!sellerId) {
      throw CustomError.invalid("Seller ID is invalid");
    }
    return (await this.getRepo()).getOrdersBySellerId(sellerId);
  }

  async getOrdersByProductId(productId: string) {
    if (!productId) {
      throw CustomError.invalid("Product ID is invalid");
    }
    return (await this.getRepo()).getOrdersByProductId(productId);
  }

  async deleteOrder(id: string, buyerId: string) {
    if (!id) {
      throw CustomError.invalid("Id is invalid");
    }
    return (await this.getRepo()).deleteOrder(id, buyerId);
  }

  async updateOrderStatus(id: string, buyerId: string, status: OrderStatus) {
    if (!id || !buyerId || !status) {
      throw CustomError.invalid("Id, Buyer ID or Status is invalid");
    }
    return (await this.getRepo()).updateOrderStatus(id, buyerId, status);
  }
}
