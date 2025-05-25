import { CartItem } from "../types";

export class Cart {
  readonly id?: string;
  readonly userId: string;
  readonly items?: CartItem[];
  readonly updatedAt: Date;

  constructor(cart: {
    id?: string;
    userId: string;
    items?: CartItem[];
    updatedAt: Date;
  }) {
    this.validate(cart);
    this.id = cart.id;
    this.userId = cart.userId;
    this.items = cart.items;
    this.updatedAt = cart.updatedAt;
  }

  validate(cart: { userId: string; items?: CartItem[]; updatedAt: Date }) {
    if (!cart.userId) throw new Error("User ID is required");
    cart.items ??= [];
    if (!cart.updatedAt) throw new Error("UpdatedAt is required");
  }

  equals({
    id,
    userId,
    items,
    updatedAt,
  }: {
    id: string;
    userId: string;
    items?: CartItem[];
    updatedAt: Date;
  }) {
    return (
      this.id === id &&
      this.userId === userId &&
      (this.items?.length ?? 0) === (items?.length ?? 0) &&
      (this.items ?? []).every(
        (item, index) =>
          JSON.stringify(item) === JSON.stringify((items ?? [])[index])
      ) &&
      this.updatedAt.getTime() === updatedAt.getTime()
    );
  }
}
