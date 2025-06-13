import { Cart, CartItem } from "types";

const saveCart = (items: CartItem[]) => {
  const cartRaw = sessionStorage.getItem("cart");
  let cart: Partial<Cart> = {};
  if (cartRaw) {
    try {
      cart = JSON.parse(cartRaw);
    } catch {}
  }
  const newCart: Cart = {
    items,
    updatedAt: new Date(),
  };
  sessionStorage.setItem("cart", JSON.stringify(newCart));
};

const getCart = (): CartItem[] => {
  const cartRaw = sessionStorage.getItem("cart");
  if (!cartRaw) return [];
  try {
    const cart: Cart = JSON.parse(cartRaw);
    return Array.isArray(cart.items) ? cart.items : [];
  } catch {
    return [];
  }
};

const addItemToCart = (item: CartItem) => {
  const items = getCart();
  const index = items.findIndex((i) => i.productId === item.productId);
  if (index !== -1) {
    items[index].productQuantity =
      (items[index].productQuantity ?? 0) + (item.productQuantity ?? 1);
  } else {
    items.push(item);
  }
  saveCart(items);
};

const removeItemFromCart = (productId: string) => {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
};

const updateItemQuantity = (productId: string, quantity: number) => {
  const cart = getCart();
  const index = cart.findIndex((item) => item.productId === productId);

  if (index !== -1) {
    cart[index].productQuantity = quantity;
    saveCart(cart);
  }
};

const clearCart = () => {
  sessionStorage.removeItem("cart");
};

const CartService = {
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
};

export default CartService;
