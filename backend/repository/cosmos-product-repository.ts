import { Product } from "../model/product";
import { CustomError } from "../model/custom-error";
import { Category, Colors, Sizes } from "../types";
import { Review } from "../model/review";
import { Container, CosmosClient } from "@azure/cosmos";

interface CosmosDocument {
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

export class CosmosProductRepository {
  private static instance: CosmosProductRepository;

  private toProduct(document: CosmosDocument) {
    if (
      !document.id ||
      !document.name ||
      !document.description ||
      !document.price ||
      !document.brand ||
      !document.images ||
      !document.rating ||
      !document.colors ||
      !document.sizes ||
      !document.category ||
      !document.stock ||
      !document.features ||
      !document.reviews ||
      !document.sellerId
    ) {
      throw CustomError.internal("Invalid product document.");
    }

    return new Product({
      id: document.id,
      name: document.name,
      description: document.description,
      price: document.price,
      brand: document.brand,
      images: document.images,
      rating: document.rating,
      colors: document.colors,
      sizes: document.sizes,
      category: document.category,
      stock: document.stock,
      features: document.features,
      reviews: document.reviews,
      sellerId: document.sellerId,
    });
  }

  constructor(private readonly container: Container) {
    if (!container) {
      throw new Error("User Cosmos DB container is required.");
    }
  }

  static async getInstance() {
    if (!this.instance) {
      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = "Products";
      const partitionKeyPath = ["/sellerId"];

      if (!key || !endpoint) {
        throw new Error(
          "Azure Cosmos DB Key, Endpoint or Database Name not provided. Exiting..."
        );
      }

      const cosmosClient = new CosmosClient({ endpoint, key });

      const { database } = await cosmosClient.databases.createIfNotExists({
        id: databaseName,
      });
      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: {
          paths: partitionKeyPath,
        },
      });

      this.instance = new CosmosProductRepository(container);
    }
    return this.instance;
  }

  async createProduct(product: Product): Promise<Product> {
    const result = await this.container.items.create({
      name: product.name,
      description: product.description,
      price: product.price,
      brand: product.brand,
      images: product.images,
      rating: product.rating,
      colors: product.colors,
      sizes: product.sizes,
      category: product.category,
      stock: product.stock,
      features: product.features,
      reviews: product.reviews,
      sellerId: product.sellerId,
    });

    if (result && result.statusCode >= 200 && result.statusCode < 400) {
      if (!result.resource?.id) {
        throw CustomError.internal("Product ID is undefined.");
      }
      return this.getProduct(result.resource.id);
    } else {
      throw CustomError.internal("Could not create product.");
    }
  }

  async getProduct(id: string): Promise<Product> {
    const { resource } = await this.container.item(id, id).read();
    if (!resource) {
      throw CustomError.notFound("Product not found.");
    }
    return this.toProduct(resource);
  }

  async getAllProducts(): Promise<Product[]> {
    const { resources } = await this.container.items
      .query("SELECT * FROM c")
      .fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No products found.");
    }
    return resources.map((doc) => this.toProduct(doc));
  }

  async updateProduct(id: string, product: Product): Promise<Product> {
    const result = await this.container.item(id, id).replace({
      id,
      ...product,
    });

    if (result.statusCode !== 200) {
      throw CustomError.notFound("Product not found.");
    }
    return this.getProduct(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.container.item(id, id).delete();
    return result.statusCode === 204;
  }
}
