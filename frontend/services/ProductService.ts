import { Product } from "types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const getAllProducts = () => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + "/products" + process.env.FK_PRODUCTS,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const getProduct = (id: string, sellerId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/products/id/${id}/seller/${sellerId}` +
      process.env.FK_PRODUCTS_GET_BY_ID_SELLER_ID,
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
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/products" +
      process.env.FK_PRODUCTS_CREATE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(product),
    }
  );
};

const updateProduct = (id: string, product: Product) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/products/${id}` +
      process.env.FK_PRODUCTS_UPDATE,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(product),
    }
  );
};

const getProductsBySellerId = (sellerId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/products/seller/${sellerId}` +
      process.env.FK_PRODUCTS_GET_BY_SELLER_ID,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

const deleteProduct = (id: string, sellerId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/products/${id}/${sellerId}` +
      process.env.FK_PRODUCTS_DELETE,
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
    process.env.NEXT_PUBLIC_API_URL +
      `/getPartitionKeyForProduct/seller/partitionKey/${id}` +
      process.env.FK_PRODUCTS_GET_PARTITION_KEY,
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
