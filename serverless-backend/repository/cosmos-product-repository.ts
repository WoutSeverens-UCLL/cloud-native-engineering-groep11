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
  sellerId: string;
}

export class CosmosProductRepository {
  private static instance: CosmosProductRepository;

  private toProduct(document: CosmosDocument) {
    if (
      !document.id ||
      !document.name ||
      !document.description ||
      !document.price ||
      !document.category ||
      !document.stock ||
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

  constructor(
    private readonly container: Container,
    private readonly reviewContainer: Container
  ) {
    if (!container || !reviewContainer) {
      throw new Error(
        "Both product and review Cosmos DB containers are required."
      );
    }
    this.container = container;
    this.reviewContainer = reviewContainer;
  }

  static async getInstance() {
    if (!this.instance) {
      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = "Products";
      const reviewContainerName = "Reviews";
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

      const { container: reviewContainer } =
        await database.containers.createIfNotExists({
          id: reviewContainerName,
          partitionKey: {
            paths: ["/productId"],
          },
        });

      this.instance = new CosmosProductRepository(container, reviewContainer);
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

    if (!result.resource || !result.resource.id) {
      throw CustomError.internal(
        "Could not create product. Resource or ID missing."
      );
    }

    return this.getProduct(result.resource.id, product.sellerId);
  }

  async getProduct(id: string, sellerId: string): Promise<Product> {
    const { resource } = await this.container.item(id, sellerId).read();
    if (!resource) {
      throw CustomError.notFound("Product has not found.");
    }
    return this.toProduct(resource);
  }

  async getAllProducts(): Promise<Product[]> {
    const { resources: products } = await this.container.items
      .query("SELECT * FROM c")
      .fetchAll();

    if (!products || products.length === 0) {
      throw CustomError.notFound("No products found.");
    }

    // Reviews ophalen
    const { resources: reviews } = await this.reviewContainer.items
      .query("SELECT c.productId, c.rating FROM c")
      .fetchAll();

    // Gemiddelde ratings berekenen per productId
    const ratingMap = new Map<string, { total: number; count: number }>();
    for (const review of reviews) {
      if (!review.productId || typeof review.rating !== "number") continue;
      const entry = ratingMap.get(review.productId) || { total: 0, count: 0 };
      entry.total += review.rating;
      entry.count += 1;
      ratingMap.set(review.productId, entry);
    }

    // Producten converteren met hun gemiddelde rating
    return products.map((doc) => {
      const base = this.toProduct(doc);
      const rating = ratingMap.get(base.id || "");
      const averageRating =
        rating && rating.count > 0
          ? parseFloat((rating.total / rating.count).toFixed(1))
          : 0;
      return new Product({ ...base, rating: averageRating });
    });
  }

  async getProductsBySellerId(sellerId: string): Promise<Product[]> {
    const query = {
      query: "SELECT * FROM c WHERE c.sellerId = @sellerId",
      parameters: [{ name: "@sellerId", value: sellerId }],
    };

    const { resources } = await this.container.items
      .query(query, { partitionKey: sellerId })
      .fetchAll();

    return (resources ?? []).map((doc) => this.toProduct(doc));
  }

  async updateProduct(id: string, product: Product): Promise<Product> {
    const result = await this.container.item(id, product.sellerId).replace({
      id,
      ...product,
    });

    if (result.statusCode !== 200) {
      throw CustomError.notFound("Product not found.");
    }
    return this.getProduct(id, product.sellerId);
  }

  async deleteProduct(id: string, sellerId: string): Promise<boolean> {
    const result = await this.container.item(id, sellerId).delete();
    return result.statusCode === 204;
  }

  async getPartitionKeyForProduct(productId: string): Promise<string> {
    try {
      const query = {
        query: "SELECT VALUE c.sellerId FROM c WHERE c.id = @id",
        parameters: [
          {
            name: "@id",
            value: productId,
          },
        ],
      };

      const { resources } = await this.container.items.query(query).fetchAll();
      console.log("Resources gevonden:", resources);

      if (!resources || resources.length === 0) {
        throw CustomError.notFound(`Product met ID ${productId} niet gevonden`);
      }

      return resources[0] as string;
    } catch (error) {
      console.error(
        `Fout bij ophalen partition key voor product ${productId}:`,
        error
      );
      throw error;
    }
  }
}
