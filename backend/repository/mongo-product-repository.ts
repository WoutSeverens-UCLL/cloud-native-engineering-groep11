import { MongoClient, Collection, Document, ObjectId } from "mongodb";
import { Product } from "../model/product";
import { CustomError } from "../model/custom-error";

export class MongoProductRepository {
  private static instance: MongoProductRepository;

  constructor(private readonly collection: Collection) {
    if (!collection) {
      throw new Error("Product Collection is required.");
    }
  }

  static async getInstance(): Promise<MongoProductRepository> {
    if (!this.instance) {
      const mongoClient = new MongoClient(
        process.env.DB_CONN_STRING || "mongodb://root:root@mongo:27017"
      );
      await mongoClient.connect();
      const db = mongoClient.db(process.env.DB_NAME || "my-db");
      const collection = db.collection(
        process.env.PRODUCT_COLLECTION_NAME || "products"
      );
      this.instance = new MongoProductRepository(collection);
    }
    return this.instance;
  }

  private toProduct(document: Document): Product {
    if (
      !document.name ||
      !document.description ||
      !document.price ||
      !document.category ||
      !document.stock
    ) {
      throw CustomError.internal("Invalid product document.");
    }

    return new Product({
      id: document._id?.toString(),
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

  async createProduct(product: Product): Promise<Product> {
    const result = await this.collection.insertOne({
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

    if (result.acknowledged) {
      return this.getProduct(product.id!);
    } else {
      throw CustomError.internal("Could not create product.");
    }
  }

  async productExists(id: string): Promise<boolean> {
    const result = await this.collection.findOne({ _id: new ObjectId(id) });
    return !!result;
  }

  async getProduct(id: string): Promise<Product> {
    const result = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!result) {
      throw CustomError.notFound("Product not found.");
    }
    return this.toProduct(result);
  }

  async getAllProducts(): Promise<Product[]> {
    const result = await this.collection.find({}).toArray();
    return result.map((doc) => this.toProduct(doc));
  }

  async updateProduct(id: string, product: Product): Promise<Product> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...product } }
    );
    if (result.modifiedCount === 0) {
      throw CustomError.notFound("Product not found.");
    }
    return this.getProduct(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(id),
    });
    return !!result.acknowledged && result.deletedCount === 1;
  }
}
