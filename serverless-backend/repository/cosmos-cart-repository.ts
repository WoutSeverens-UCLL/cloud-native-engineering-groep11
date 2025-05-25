import { Container, CosmosClient } from "@azure/cosmos";
import { Cart } from "../model/cart.model";
import { CartItem } from "../types";
import { CustomError } from "../model/custom-error";

interface CosmosDocument {
  id?: string;
  userId: string;
  items?: CartItem[];
  updatedAt: Date;
}

export class CosmosCartRepository {
  private static instance: CosmosCartRepository;

  private toCart(document: CosmosDocument) {
    if (!document.id || !document.userId || !document.updatedAt) {
      throw new Error("Invalid cart document.");
    }

    return new Cart({
      id: document.id,
      userId: document.userId,
      items: document.items,
      updatedAt: document.updatedAt,
    });
  }

  constructor(private readonly container: Container) {
    if (!container) {
      throw new Error("Cart Cosmos DB container is required.");
    }
  }

  static async getInstance() {
    if (!this.instance) {
      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = "Carts";
      const partitionKeyPath = ["/userId"];

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

      this.instance = new CosmosCartRepository(container);
    }

    return this.instance;
  }

  async createCart(cart: Cart): Promise<Cart> {
    const result = await this.container.items.create({
      userId: cart.userId,
      items: cart.items,
      updatedAt: cart.updatedAt,
    });

    if (!result.resource || !result.resource.id) {
      throw CustomError.internal(
        "Could not create cart. Resource or ID missing."
      );
    }
    return this.getCart(result.resource.id, cart.userId);
  }

  async getCart(id: string, userId: string): Promise<Cart> {
    const { resource } = await this.container.item(id, userId).read();
    if (!resource) {
      throw CustomError.notFound("Cart not found.");
    }
    return this.toCart(resource);
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    const { resources } = await this.container.items
      .query({
        query: "SELECT * FROM c WHERE c.userId = @userId",
        parameters: [{ name: "@userId", value: userId }],
      })
      .fetchAll();

    if (!resources || resources.length === 0) {
      return null;
    }

    return this.toCart(resources[0]);
  }

  async addItemToCart(item: CartItem, userId: string): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);

    // Create patch operations
    const operations = [
      {
        op: "add" as const,
        path: "/items/-",
        value: item,
      },
      {
        op: "set" as const,
        path: "/updatedAt",
        value: new Date(),
      },
    ];

    if (!cart) {
      throw CustomError.notFound("Cart not found for user.");
    }

    // Ensure cart.id is defined
    if (!cart.id) {
      throw CustomError.internal("Cart ID is missing.");
    }

    // Perform patch operation
    const { resource } = await this.container.item(cart.id, userId).patch({
      operations,
    });

    return this.toCart(resource);
  }

  async removeItemFromCart(itemId: string, userId: string): Promise<Cart> {
    // First retrieve the current cart
    const cart = await this.getCartByUserId(userId);

    if (!cart) {
      throw CustomError.notFound("Cart not found for user.");
    }

    // Filter out the item to remove
    const updatedItems = cart.items?.filter(
      (item) => item.productId !== itemId
    );

    // Check if the item exists in the cart
    if (!updatedItems || updatedItems.length === cart.items?.length) {
      throw CustomError.notFound(`Item ${itemId} not found in cart`);
    }

    // Create patch operations
    const operations = [
      {
        op: "replace" as const,
        path: "/items",
        value: updatedItems,
      },
      {
        op: "set" as const,
        path: "/updatedAt",
        value: new Date(),
      },
    ];

    if (!cart.id) {
      throw CustomError.internal("Cart ID is missing.");
    }

    // Perform patch operation
    const { resource } = await this.container.item(cart.id, userId).patch({
      operations,
    });

    return this.toCart(resource);
  }

  async clearItemsFromCart(userId: string): Promise<Cart> {
    // First retrieve the current cart
    const cart = await this.getCartByUserId(userId);

    // Create patch operations to clear items and update timestamp
    const operations = [
      {
        op: "set" as const,
        path: "/items",
        value: [],
      },
      {
        op: "set" as const,
        path: "/updatedAt",
        value: new Date(),
      },
    ];

    // Ensure cart exists and has an ID
    if (!cart) {
      throw CustomError.notFound("Cart not found for user.");
    }
    if (!cart.id) {
      throw CustomError.internal("Cart ID is missing");
    }

    // Perform patch operation
    const { resource } = await this.container.item(cart.id, userId).patch({
      operations,
    });

    return this.toCart(resource);
  }

  async updateQuantity(
    itemId: string,
    userId: string,
    quantity: number
  ): Promise<Cart> {
    // First retrieve the current cart
    const cart = await this.getCartByUserId(userId);
    if (!cart) {
      throw CustomError.notFound("Cart not found for user.");
    }

    // Find the item to update
    const existingItemIndex = cart.items?.findIndex(
      (item) => item.productId === itemId
    );

    // Check if the item exists in the cart
    if (existingItemIndex === undefined || existingItemIndex === -1) {
      throw CustomError.notFound(`Item ${itemId} not found in cart`);
    }

    // Validate quantity
    if (quantity <= 0) {
      throw CustomError.invalid("Quantity must be greater than zero");
    }

    // Update item in the local array
    cart.items![existingItemIndex].quantity = quantity;

    // Create patch operations to replace the whole items array
    const operations = [
      {
        op: "set" as const,
        path: `/items`,
        value: cart.items,
      },
      {
        op: "set" as const,
        path: "/updatedAt",
        value: new Date(),
      },
    ];

    // Ensure cart ID is defined
    if (!cart.id) {
      throw CustomError.internal("Cart ID is missing.");
    }

    // Perform patch operation
    const { resource } = await this.container.item(cart.id, userId).patch({
      operations,
    });

    return this.toCart(resource);
  }
}
