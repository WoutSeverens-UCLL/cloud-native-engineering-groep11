import { Product } from "types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const getAllProducts = () => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

const getProduct = (id: string, sellerId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/products/${id}/${sellerId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const createProduct = (product: Product) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(product),
  });
};

const updateProduct = (id: string, product: Product) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(product),
  });
};

const getProductsBySellerId = (sellerId: string) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + `/products/${sellerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

const deleteProduct = (id: string, sellerId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/products/${id}/${sellerId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const getPartitionKeyForProduct = (id: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/products/seller/partitionKey/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const ProductService = {
  getAllProducts,
  getProduct,
  createProduct,
  getProductsBySellerId,
  deleteProduct,
  updateProduct,
  getPartitionKeyForProduct,
};

export default ProductService;
