import { MongoClient, Collection, Document, ObjectId } from "mongodb";
import { Review } from "../model/review";
import { CustomError } from "../model/custom-error";

export class MongoReviewRepository {
  private static instance: MongoReviewRepository;

  constructor(private readonly collection: Collection) {
    if (!collection) {
      throw new Error("Review Collection is required.");
    }
  }

  static async getInstance(): Promise<MongoReviewRepository> {
    if (!this.instance) {
      const mongoClient = new MongoClient(
        process.env.DB_CONN_STRING || "mongodb://root:root@mongo:27017"
      );
      await mongoClient.connect();
      const db = mongoClient.db(process.env.DB_NAME || "my-db");
      const collection = db.collection(
        process.env.REVIEW_COLLECTION_NAME || "reviews"
      );
      this.instance = new MongoReviewRepository(collection);
    }
    return this.instance;
  }

  private toReview(document: Document): Review {
    if (!document.title || !document.content || !document.userId) {
      throw CustomError.internal("Invalid review document.");
    }

    return new Review({
      id: document._id?.toString(),
      productId: document.prductId,
      userId: document.userId,
      rating: document.rating,
      comment: document.comment,
    });
  }

  async create(review: Review): Promise<Review> {
    const result = await this.collection.insertOne({
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
    });

    if (result.acknowledged) {
      return this.getReview(result.insertedId.toString());
    } else {
      throw CustomError.internal("Could not create review.");
    }
  }

  async getReview(id: string): Promise<Review> {
    const result = await this.collection.findOne({
      _id: new ObjectId(id),
    });
    if (!result) {
      throw CustomError.notFound("Review not found.");
    }
    return this.toReview(result);
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    const result = await this.collection.find({ productId }).toArray();
    if (!result) {
      throw CustomError.notFound("No reviews found for this product.");
    }
    return result.map((doc) => this.toReview(doc));
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    const result = await this.collection.find({ userId }).toArray();
    if (!result) {
      throw CustomError.notFound("No reviews found for this user.");
    }
    return result.map((doc) => this.toReview(doc));
  }

  async updateReview(id: string, review: Review): Promise<Review> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...review } }
    );
    if (result.matchedCount === 0) {
      throw CustomError.notFound("Review not found.");
    }
    return this.getReview(id);
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
    });
    return !!result.acknowledged && result.deletedCount === 1;
  }
}
