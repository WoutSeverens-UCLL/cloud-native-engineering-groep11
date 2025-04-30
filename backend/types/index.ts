export enum Role {
  BUYER = 'buyer',
  ADMIN = 'admin',
  SELLER = 'seller',
}
export type Category =
  | "electronics"
  | "clothing"
  | "home"
  | "books"
  | "toys"
  | "sports"
  | "health"
  | "beauty"
  | "automotive"
  | "grocery";
export type Sizes = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type Colors =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "black"
  | "white"
  | "purple"
  | "pink"
  | "orange"
  | "brown";

export type UserInput = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

export type AuthenticationResponse ={
  message: string;
  token: string;
  email: string;
  role: Role;
}
