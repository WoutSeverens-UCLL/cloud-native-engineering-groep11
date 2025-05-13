const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
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

const ProductService = {
    getProduct,
};

export default ProductService;