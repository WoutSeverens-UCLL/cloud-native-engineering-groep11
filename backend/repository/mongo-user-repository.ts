import { MongoClient, Collection, Document } from "mongodb";
import { User } from "../model/user";
import { CustomError } from "../model/custom-error";

export class MongoUserRepository {
  private static instance: MongoUserRepository;

  constructor(private readonly collection: Collection) {
    if (!collection) {
      throw new Error("User Collection is required.");
    }
  }

  static async getInstance(): Promise<MongoUserRepository> {
    if (!this.instance) {
      const mongoClient = new MongoClient(
        process.env.DB_CONN_STRING || "mongodb://root:root@mongo:27017"
      );
      await mongoClient.connect();
      const db = mongoClient.db(process.env.DB_NAME || "my-db");
      const collection = db.collection(
        process.env.USER_COLLECTION_NAME || "users"
      );
      this.instance = new MongoUserRepository(collection);
    }
    return this.instance;
  }

  private toUser(document: Document): User {
    if (
      !document.email ||
      !document.password ||
      !document.firstName ||
      !document.lastName ||
      !document.role
    ) {
      throw CustomError.internal("Invalid user document.");
    }

    return new User({
      id: document._id?.toString(),
      firstName: document.firstName,
      lastName: document.lastName,
      email: document.email,
      password: document.password,
      role: document.role,
    });
  }

  async createUser(user: User): Promise<User> {
    const result = await this.collection.insertOne({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      role: user.role,
    });

    if (result.acknowledged) {
      return this.getUser(user.email);
    } else {
      throw CustomError.internal("Could not create user.");
    }
  }

  async userExists(email: string): Promise<boolean> {
    const result = await this.collection.findOne({ email });
    return !!result;
  }

  async getUser(email: string): Promise<User> {
    const result = await this.collection.findOne({ email });
    if (!result) {
      throw CustomError.notFound("User not found.");
    }
    return this.toUser(result);
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.collection.find({}).toArray();
    if (!result) {
      throw CustomError.notFound("No users found.");
    }
    return result.map((doc) => this.toUser(doc));
  }

  async deleteUser(email: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ email });
    return !!result.acknowledged && result.deletedCount === 1;
  }
}
