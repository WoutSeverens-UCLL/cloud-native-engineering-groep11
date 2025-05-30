import { Container, CosmosClient } from "@azure/cosmos";
import { Payment } from "../model/payment";
import { PaymentStatus } from "../types";
import { CustomError } from "../model/custom-error";

interface CosmosDocument {
  id?: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  firstName: string;
  lastName: string;
  billingAddress: string;
  shippingAddress: string;
  email: string;
  createdAt: string;
  paidAt?: string;
  cardDetails?: {
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    cvv?: string;
  };
}

export class CosmosPaymentRepository {
  private static instance: CosmosPaymentRepository;

  private toPayment(document: CosmosDocument) {
    if (
      !document.orderId ||
      !document.amount ||
      !document.status ||
      !document.paymentMethod ||
      !document.firstName ||
      !document.lastName ||
      !document.billingAddress ||
      !document.shippingAddress ||
      !document.email ||
      !document.createdAt
    ) {
      throw new Error("Invalid payment document.");
    }

    return new Payment({
      id: document.id,
      orderId: document.orderId,
      amount: document.amount,
      status: document.status,
      paymentMethod: document.paymentMethod,
      firstName: document.firstName,
      lastName: document.lastName,
      billingAddress: document.billingAddress,
      shippingAddress: document.shippingAddress,
      email: document.email,
      createdAt: document.createdAt,
      paidAt: document.paidAt ?? new Date().toISOString(),
      cardDetails: document.cardDetails ?? {
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: "",
      },
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
      const containerName = "Payments";
      const partitionKeyPath = ["/orderId"];

      if (!key || !endpoint) {
        throw new Error("Cosmos DB key or endpoint is not defined.");
      }

      const cosmosClient = new CosmosClient({ endpoint, key });
      const { database } = await cosmosClient.databases.createIfNotExists({
        id: databaseName,
      });
      const { container } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: partitionKeyPath },
      });

      this.instance = new CosmosPaymentRepository(container);
    }
    return this.instance;
  }

  async createPayment(payment: Payment) {
    const result = await this.container.items.create({
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      firstName: payment.firstName,
      lastName: payment.lastName,
      billingAddress: payment.billingAddress,
      shippingAddress: payment.shippingAddress,
      email: payment.email,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      cardDetails: payment.cardDetails,
    });

    if (!result.resource || !result.resource.id) {
      throw CustomError.internal(
        "Could not create payment. Resource or ID missing."
      );
    }

    return this.getPayment(result.resource.id, payment.orderId);
  }

  async getPayment(id: string, orderId: string): Promise<Payment> {
    const { resource } = await this.container.item(id, orderId).read();
    if (!resource) {
      throw CustomError.notFound("Payment not found.");
    }
    return this.toPayment(resource);
  }

  async getAllPayments(): Promise<Payment[]> {
    const { resources } = await this.container.items
      .query("SELECT * FROM c")
      .fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No payments found.");
    }
    return resources.map((doc) => this.toPayment(doc));
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    const query = {
      query: "SELECT * FROM c WHERE c.orderId = @orderId",
      parameters: [{ name: "@orderId", value: orderId }],
    };

    const { resources } = await this.container.items
      .query(query, { partitionKey: orderId })
      .fetchAll();
    if (!resources || resources.length === 0) {
      throw CustomError.notFound("No payments found for this order.");
    }
    return resources.map((doc) => this.toPayment(doc));
  }

  async deletePayment(id: string, orderId: string): Promise<boolean> {
    const result = await this.container.item(id, orderId).delete();
    return result.statusCode === 204;
  }

  async updatePaymentStatus(
    id: string,
    orderId: string,
    status: PaymentStatus
  ): Promise<Payment> {
    const { resource: existingDoc } = await this.container
      .item(id, orderId)
      .read<CosmosDocument>();

    if (!existingDoc) {
      throw CustomError.notFound("Order not found.");
    }

    const updatedDoc: CosmosDocument = {
      ...existingDoc,
      status,
      paidAt: new Date().toISOString(),
    };

    const { resource: replacedDoc } = await this.container
      .item(id, orderId)
      .replace(updatedDoc);

    if (!replacedDoc) {
      throw CustomError.internal("Failed to update the payment.");
    }

    return this.toPayment(replacedDoc);
  }
}
