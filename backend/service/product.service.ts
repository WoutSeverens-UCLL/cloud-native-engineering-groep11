import { CustomError } from "../model/custom-error";
import { Product } from "../model/product";
import { MongoProductRepository } from "../repository/mongo-product-repository";

export class ProductService {
  private static intance: ProductService;

  static getInstance() {
    if (!this.intance) {
      this.intance = new ProductService();
    }
    return this.intance;
  }

  private async getRepo() {
    return MongoProductRepository.getInstance();
  }

  async createProduct(product: Product) {
    const createdProduct = new Product({
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
    return (await this.getRepo()).createProduct(createdProduct);
  }

    async getAllProducts() {
        return (await this.getRepo()).getAllProducts();
    }

    async getProduct(id: string) {
        if (!id) {
            throw CustomError.invalid("Id is invalid");
        }
        return (await this.getRepo()).getProduct(id);
    }

    async deleteProduct(id: string) {
        if (!id) {
            throw CustomError.invalid("Id is invalid");
        }
        return (await this.getRepo()).deleteProduct(id);
    }

    async updateProduct(id: string, product: Product) {
        if (!id) {
            throw CustomError.invalid("Id is invalid");
        }
        return (await this.getRepo()).updateProduct(id, product);
    }

}
