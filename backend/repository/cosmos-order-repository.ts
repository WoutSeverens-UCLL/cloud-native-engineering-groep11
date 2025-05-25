import { Container, CosmosClient } from "@azure/cosmos";
import { Order } from "../model/order";
import { OrderStatus } from "../types";
import { CustomError } from "../model/custom-error";
import { Product } from "../model/product";

interface CosmosDocument {
  id?: string;
  products: Product[];
  sellerId: string;
  buyerId: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export class CosmosOrderRepository {
  private static instance: CosmosOrderRepository;

  private toOrder(document: CosmosDocument) {
    if (
      !document.products ||
      !document.sellerId ||
      !document.buyerId ||
      !document.quantity ||
      !document.totalAmount ||
      !document.status ||
      !document.createdAt
    ) {
      throw new Error("Invalid order document.");
    }

    return new Order({
      id: document.id,
      products: document.products,
      sellerId: document.sellerId,
      buyerId: document.buyerId,
      quantity: document.quantity,
      totalAmount: document.totalAmount,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt ?? new Date().toISOString(),
    });
  }

  constructor(private readonly container: Container) {
    if (!container) {
      throw new Error("Container is not defined.");
    }
  }

  static async getInstance() {
    if (!this.instance) {
      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      const containerName = "Orders";
      const partitionKeyPath = ["/buyerId"];

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
        partitionKey: { paths: partitionKeyPath },
      });

      this.instance = new CosmosOrderRepository(container);
    }
    return this.instance;
  }

  async createOrder(order: Order): Promise<Order> {
    const result = await this.container.items.create({
      products: order.products,
      sellerId: order.sellerId,
      buyerId: order.buyerId,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });

    if (!result.resource || !result.resource.id) {
      throw CustomError.internal(
        "Could not create order. Resource or ID missing."
      );
    }

    return this.getOrder(result.resource.id, order.buyerId);
  }

  async getOrder(id: string, buyerId: string): Promise<Order> {
    const { resource } = await this.container.item(id, buyerId).read();
    if (!resource) {
      throw CustomError.notFound("Order not found.");
    }
    return this.toOrder(resource);
  }

  async getAllOrders(): Promise<Order[]> {
    const { resources } = await this.container.items
      .query("SELECT * FROM c")
      .fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No orders found.");
    }
    return resources.map((doc) => this.toOrder(doc));
  }

  async getPartitionKeyForOrder(orderId: string): Promise<string> {
    try {
      const query = {
        query: "SELECT VALUE c.buyerId FROM c WHERE c.id = @id",
        parameters: [
          {
            name: "@id",
            value: orderId,
          },
        ],
      };

      const { resources } = await this.container.items.query(query).fetchAll();
      console.log("Resources gevonden:", resources);

      if (!resources || resources.length === 0) {
        throw CustomError.notFound(`Product met ID ${orderId} niet gevonden`);
      }

      return resources[0] as string;
    } catch (error) {
      console.error(
        `Fout bij ophalen partition key voor product ${orderId}:`,
        error
      );
      throw error;
    }
  }

  async getOrdersByBuyerId(buyerId: string): Promise<Order[]> {
    const query = {
      query: "SELECT * FROM c WHERE c.buyerId = @buyerId",
      parameters: [{ name: "@buyerId", value: buyerId }],
    };

    const { resources } = await this.container.items
      .query(query, { partitionKey: buyerId })
      .fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No orders found for this buyer.");
    }
    return resources.map((doc) => this.toOrder(doc));
  }

  async getProductsByOrderId(orderId: string): Promise<Product[]> {
    const query = {
      query: "SELECT c.products FROM c WHERE c.id = @orderId",
      parameters: [{ name: "@orderId", value: orderId }],
    };

    const { resources } = await this.container.items.query(query).fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No products found for this order.");
    }

    return resources.flatMap((doc) => doc.products ?? []);
  }

  async getOrdersBySellerId(sellerId: string): Promise<Order[]> {
    const query = {
      query: "SELECT * FROM c WHERE c.sellerId = @sellerId",
      parameters: [{ name: "@sellerId", value: sellerId }],
    };

    const { resources } = await this.container.items.query(query).fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No orders found for this seller.");
    }
    return resources.map((doc) => this.toOrder(doc));
  }

  async getOrdersByProductId(productId: string): Promise<Order[]> {
    const query = {
      query: "SELECT * FROM c WHERE c.productId = @productId",
      parameters: [{ name: "@productId", value: productId }],
    };

    const { resources } = await this.container.items.query(query).fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No orders found for this product.");
    }
    return resources.map((doc) => this.toOrder(doc));
  }

  async deleteOrder(id: string, buyerId: string): Promise<boolean> {
    const result = await this.container.item(id, buyerId).delete();
    return result.statusCode === 204;
  }

  async updateOrderStatus(
    id: string,
    buyerId: string,
    status: OrderStatus
  ): Promise<Order> {
    const { resource: existingDoc } = await this.container
      .item(id, buyerId)
      .read<CosmosDocument>();

    if (!existingDoc) {
      throw CustomError.notFound("Order not found.");
    }

    const updatedDoc: CosmosDocument = {
      ...existingDoc,
      status,
      updatedAt: new Date().toISOString(),
    };

    const { resource: replacedDoc } = await this.container
      .item(id, buyerId)
      .replace(updatedDoc);

    if (!replacedDoc) {
      throw CustomError.internal("Failed to update the order.");
    }

    return this.toOrder(replacedDoc);
  }
}
