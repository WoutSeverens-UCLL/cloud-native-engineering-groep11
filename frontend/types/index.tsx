export type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
};

export type Product = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  brand?: string;
  images?: string[];
  rating?: number;
  colors?: string[];
  sizes?: string[];
  category?: string;
  stock?: number;
  features?: string[];
  reviews?: Review[];
  sellerId?: string;
};

export type Review = {
  id?: string;
  productId?: string;
  userId?: string;
  rating?: number;
  comment?: string;
};

export type StatusMessage = {
  type: "success" | "error";
  message: string;
};
