import { Cart, CartItem } from "types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const createCart = async (cart: Cart) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + "/carts" + process.env.FK_CARTS_CREATE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(cart),
    }
  );
};

const getCart = async (id: string, userId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/carts/${id}/user/${userId}` +
      process.env.FK_CARTS_GET_BY_ID_USER_ID,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const getCartByUserId = async (userId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/carts/${userId}` +
      process.env.FK_CARTS_GET_BY_USER_ID,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const addItemToCart = async (item: CartItem, userId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/carts/${userId}/items` +
      process.env.FK_CARTS_ADD_ITEM,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(item),
    }
  );
};

const removeItemFromCart = async (itemId: string, userId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/carts/${userId}/items/${itemId}` +
      process.env.FK_CARTS_REMOVE_ITEM,
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
    process.env.NEXT_PUBLIC_API_URL +
      `/carts/${userId}/items/all/clear` +
      process.env.FK_CARTS_CLEAR,
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
    process.env.NEXT_PUBLIC_API_URL +
      `/carts/${userId}/items/${itemId}/quantity` +
      process.env.FK_CARTS_UPDATE_QUANTITY,
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
