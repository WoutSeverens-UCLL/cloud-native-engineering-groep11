import { Cart } from "../model/cart.model";
import { CosmosCartRepository } from "../repository/cosmos-cart-repository";
import { CartItem } from "../types";

export class CartService {
  private static instance: CartService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new CartService();
    }
    return this.instance;
  }

  private async getRepo() {
    return CosmosCartRepository.getInstance();
  }

  async createCart(cart: Cart) {
    const createdCart = new Cart({
      userId: cart.userId,
      items: cart.items,
      updatedAt: cart.updatedAt,
    });
    return (await this.getRepo()).createCart(createdCart);
  }

  async getCart(id: string, userId: string) {
    if (!id) {
      throw new Error("Id is invalid");
    }
    return (await this.getRepo()).getCart(id, userId);
  }

  async getCartByUserId(userId: string) {
    if (!userId) {
      throw new Error("User ID is invalid");
    }
    return (await this.getRepo()).getCartByUserId(userId);
  }

  async addItemToCart(item: CartItem, userId: string): Promise<Cart> {
    if (!userId) {
      throw new Error("User ID is invalid");
    }
    return (await this.getRepo()).addItemToCart(item, userId);
  }

  async removeItemFromCart(itemId: string, userId: string): Promise<Cart> {
    if (!userId) {
      throw new Error("User ID is invalid");
    }
    return (await this.getRepo()).removeItemFromCart(itemId, userId);
  }

  async clearItemsFromCart(userId: string): Promise<Cart> {
    if (!userId) {
      throw new Error("User ID is invalid");
    }
    return (await this.getRepo()).clearItemsFromCart(userId);
  }

  async updateQuantity(
    itemId: string,
    userId: string,
    quantity: number
  ): Promise<Cart> {
    if (!userId) {
      throw new Error("User ID is invalid");
    }
    return (await this.getRepo()).updateQuantity(itemId, userId, quantity);
  }
}
