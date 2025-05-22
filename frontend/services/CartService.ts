import { Cart, CartItem } from "types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const createCart = async (cart: Cart) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/carts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(cart),
  });
};

const getCart = async (id: string, userId: string) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/carts/${id}/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

const getCartByUserId = async (userId: string) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/carts/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

const addItemToCart = async (item: CartItem, userId: string) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/carts/${userId}/items`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(item),
  });
};

const removeItemFromCart = async (itemId: string, userId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/carts/${userId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const clearItemFromCart = async (userId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/carts/${userId}/items/all/clear`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const updateQuantity = async (
  itemId: string,
  userId: string,
  quantity: number
) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/carts/${userId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ quantity }),
    }
  );
};

const CartService = {
  createCart,
  getCart,
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  clearItemFromCart,
  updateQuantity,
};

export default CartService;
