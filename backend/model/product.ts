import { Category, Colors, Sizes } from "../types";
import { Review } from "./review";

interface ProductParams {
  id?: string;
  name: string;
  description: string;
  price: number;
  brand?: string;
  images?: string[];
  rating?: number;
  colors?: Colors[];
  sizes?: Sizes[];
  category: Category;
  stock: number;
  features?: string[];
  reviews?: Review[];
  sellerId?: string;
}

export class Product {
  readonly id?: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly brand?: string;
  readonly images: string[];
  readonly rating: number;
  readonly colors: Colors[];
  readonly sizes: Sizes[];
  readonly category: Category;
  readonly stock: number;
  readonly features: string[];
  readonly reviews: Review[];
  readonly sellerId?: string;

  constructor({
    id,
    name,
    description,
    price,
    brand,
    images = [],
    rating = 0,
    colors = [],
    sizes = [],
    category,
    stock,
    features = [],
    reviews = [],
    sellerId,
  }: ProductParams) {
    this.validate({ name, description, price, category, stock });

    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.brand = brand;
    this.images = images;
    this.rating = rating;
    this.colors = colors;
    this.sizes = sizes;
    this.category = category;
    this.stock = stock;
    this.features = features;
    this.reviews = reviews;
    this.sellerId = sellerId;
  }

  private validate({
    name,
    description,
    price,
    category,
    stock,
  }: Pick<
    ProductParams,
    "name" | "description" | "price" | "category" | "stock"
  >) {
    if (!name?.trim()) throw new Error("Name cannot be empty.");
    if (!description?.trim()) throw new Error("Description cannot be empty.");
    if (typeof price !== "number" || price <= 0)
      throw new Error("Price must be a positive number.");
    if (!category?.trim()) throw new Error("Category cannot be empty.");
    if (!Number.isInteger(stock) || stock < 0)
      throw new Error("Stock must be a non-negative integer.");
  }

  equals(other: Product): boolean {
    return (
      this.id === other.id &&
      this.name === other.name &&
      this.description === other.description &&
      this.price === other.price &&
      this.category === other.category &&
      this.stock === other.stock
    );
  }
}
