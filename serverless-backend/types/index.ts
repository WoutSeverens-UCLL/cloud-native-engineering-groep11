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
export enum Sizes {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "XXXL",
}
export enum Colors {
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
  YELLOW = "yellow",
  BLACK = "black",
  WHITE = "white",
  ORANGE = "orange",
  PURPLE = "purple",
  PINK = "pink",
  GREY = "grey",
}

export type OrderStatus = "pending" | "completed" | "failed" | "cancelled";
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
