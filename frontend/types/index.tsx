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
  quantity?: number;
};

export type Review = {
  id?: string;
  productId?: string;
  userId?: string;
  rating?: number;
  comment?: string;
};

export type Order = {
  id?: string;
  products?: Product[];
  sellerId?: string;
  buyerId?: string;
  quantity?: number;
  totalAmount?: number;
  status?: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderStatus = "pending" | "completed" | "shipped";

export type Payment = {
  id?: string;
  orderId?: string;
  amount?: number;
  status?: PaymentStatus;
  paymentMethod?: string;
  firstName?: string;
  lastName?: string;
  billingAddress?: string;
  shippingAddress?: string;
  email?: string;
  createdAt?: string;
  paidAt?: string;
  cardDetails?: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    cvv?: string;
  };
};

export type PaymentStatus = "pending" | "paid" | "failed";

export type StatusMessage = {
  type: "success" | "error";
  message: string;
};

export type Cart = {
  userId?: string;
  items?: CartItem[];
  updatedAt?: Date;
};

export type CartItem = {
  productId?: string;
  quantity?: number;
  price?: number;
  color?: string;
};
