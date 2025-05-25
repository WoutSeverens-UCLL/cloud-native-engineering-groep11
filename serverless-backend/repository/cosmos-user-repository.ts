import { User } from "../model/user";
import { CustomError } from "../model/custom-error";
import { CosmosClient, Container } from "@azure/cosmos";
import { Role } from "../types";

interface CosmosDocument {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export class CosmosUserRepository {
  private static instance: CosmosUserRepository;

  private toUser(document: CosmosDocument) {
    if (
      !document.id ||
      !document.email ||
      !document.password ||
      !document.firstName ||
      !document.lastName ||
      !document.role
    ) {
      throw CustomError.internal("Invalid user document.");
    }

    return new User({
      id: document.id,
      firstName: document.firstName,
      lastName: document.lastName,
      email: document.email,
      password: document.password,
      role: document.role,
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
      const containerName = "Users";
      const partitionKeyPath = ["/email"];

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

      this.instance = new CosmosUserRepository(container);
    }
    return this.instance;
  }

  async createUser(user: User): Promise<User> {
    const existingUser = await this.userExists(user.email);
    if (existingUser) {
      throw CustomError.invalid("User already exists.");
    }
    const result = await this.container.items.create({
      id: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      role: user.role,
    });
    if (result && result.statusCode >= 200 && result.statusCode < 400) {
      return this.getUser(user.email);
    } else {
      throw CustomError.internal("Could not create user.");
    }
  }

  async userExists(email: string): Promise<boolean> {
    const { resource } = await this.container.item(email, email).read();
    return !!resource;
  }

  async getUser(email: string): Promise<User> {
    const { resource } = await this.container.item(email, email).read();
    if (resource) {
      return this.toUser(resource);
    } else {
      throw CustomError.notFound("User not found.");
    }
  }

  async getAllUsers(): Promise<User[]> {
    const { resources } = await this.container.items
      .query("SELECT * FROM c")
      .fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No users found.");
    }
    return resources.map((doc) => this.toUser(doc));
  }

  async deleteUser(email: string): Promise<boolean> {
    const result = await this.container.item(email, email).delete();
    if (result) {
      return true;
    } else {
      throw CustomError.notFound("User not found.");
    }
  }
}
