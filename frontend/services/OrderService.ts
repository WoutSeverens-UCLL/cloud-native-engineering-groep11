import { Order, OrderStatus } from "types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const createOrder = async (order: Order) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(order),
  });
};

const getOrder = (id: string, buyerId: string) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/orders/${id}/${buyerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

const getProductsByOrderId = (orderId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/orders/products/${orderId}/all`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const updateOrderStatus = (
  id: string,
  buyerId: string,
  status: OrderStatus
) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/orders/${id}/${buyerId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status }),
  });
};

// Get orders for a user (buyer or seller)
const getOrdersByUser = (userId: string, role: "buyer" | "seller") => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/orders/user/${role}/${userId}`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const getOrdersByProduct = (productId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/orders/product/${productId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const deleteOrder = (id: string, buyerId: string) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/orders/${id}/${buyerId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

const getPartitionKeyForOrder = (id: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/orders/buyer/partitionKey/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const OrderService = {
  createOrder,
  getOrder,
  updateOrderStatus,
  getOrdersByUser,
  getOrdersByProduct,
  deleteOrder,
  getPartitionKeyForOrder,
  getProductsByOrderId,
};

export default OrderService;
