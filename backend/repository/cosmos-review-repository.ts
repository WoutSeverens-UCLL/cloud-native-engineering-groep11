import { Review } from "../model/review";
import { CustomError } from "../model/custom-error";
import { Container, CosmosClient } from "@azure/cosmos";

interface CosmosDocument {
  id?: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}

export class CosmosReviewRepository {
  private static instance: CosmosReviewRepository;

  private toReview(document: CosmosDocument) {
    if (
      !document.id ||
      !document.productId ||
      !document.userId ||
      !document.rating ||
      !document.comment
    ) {
      throw CustomError.internal("Invalid review document.");
    }

    return new Review({
      id: document.id,
      productId: document.productId,
      userId: document.userId,
      rating: document.rating,
      comment: document.comment,
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
      const containerName = "Reviews";
      const partitionKeyPath = ["/productId"];

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

      this.instance = new CosmosReviewRepository(container);
    }
    return this.instance;
  }

  async createReview(review: Review): Promise<Review> {
    const result = await this.container.items.create({
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
    });

    if (!result.resource || !result.resource.id) {
      throw CustomError.internal(
        "Could not create review. Resource or ID missing."
      );
    }

    return this.getReview(result.resource.id, review.productId);
  }

  async getReview(id: string, productId: string): Promise<Review> {
    const { resource } = await this.container.item(id, productId).read();
    if (!resource) {
      throw CustomError.notFound("Review not found.");
    }
    return this.toReview(resource);
  }

  async getAllReviews(): Promise<Review[]> {
    const { resources } = await this.container.items
      .query("SELECT * FROM c")
      .fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No reviews found.");
    }
    return resources.map((doc) => this.toReview(doc));
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    const query = {
      query: "SELECT * FROM c WHERE c.productId = @productId",
      parameters: [{ name: "@productId", value: productId }],
    };

    const { resources } = await this.container.items
      .query(query, { partitionKey: productId })
      .fetchAll();

    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No reviews found for this product.");
    }

    return resources.map((doc) => this.toReview(doc));
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId",
      parameters: [{ name: "@userId", value: userId }],
    };

    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();

    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No reviews found for this user.");
    }

    return resources.map((doc) => this.toReview(doc));
  }

  async updateReview(id: string, review: Review): Promise<Review> {
    const result = await this.container.item(id, review.productId).replace({
      id,
      ...review,
    });
    if (result.statusCode !== 200) {
      throw CustomError.notFound("Review not found.");
    }
    return this.getReview(id, review.productId);
  }

  async deleteReview(id: string, productId: string): Promise<boolean> {
    const result = await this.container.item(id, productId).delete();
    return result.statusCode === 204;
  }
}
