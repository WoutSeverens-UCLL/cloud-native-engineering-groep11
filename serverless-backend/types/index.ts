export enum Role {
  BUYER = "buyer",
  ADMIN = "admin",
  SELLER = "seller",
}
export enum Category {
  ELECTRONICS = "electronics",
  CLOTHING = "clothing",
  HOME = "home",
  BOOKS = "books",
  TOYS = "toys",
  SPORTS = "sports",
  HEALTH = "health",
  BEAUTY = "beauty",
  AUTOMOTIVE = "automotive",
  GROCERY = "grocery",
}

export type OrderStatus = "pending" | "completed" | "shipped";
export type PaymentStatus = "pending" | "paid" | "failed";

export type UserInput = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

export type AuthenticationResponse = {
  message: string;
  token: string;
  email: string;
  role: Role;
};
