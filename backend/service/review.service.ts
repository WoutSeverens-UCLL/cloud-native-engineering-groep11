import { CustomError } from "../model/custom-error";
import { Review } from "../model/review";
import { CosmosReviewRepository } from "../repository/cosmos-review-repository";

export class ReviewService {
  private static instance: ReviewService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new ReviewService();
    }
    return this.instance;
  }

  private async getRepo() {
    return CosmosReviewRepository.getInstance();
  }

  async createReview(review: Review) {
    const createdReview = new Review({
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
    });
    return (await this.getRepo()).createReview(createdReview);
  }

  async getAllReviews() {
    return (await this.getRepo()).getAllReviews();
  }

  async getReview(id: string) {
    if (!id) {
      throw CustomError.invalid("Id is invalid");
    }
    return (await this.getRepo()).getReview(id);
  }

  async deleteReview(id: string) {
    if (!id) {
      throw CustomError.invalid("Id is invalid");
    }
    return (await this.getRepo()).deleteReview(id);
  }

  async updateReview(id: string, review: Review) {
    if (!id) {
      throw CustomError.invalid("Id is invalid");
    }
    return (await this.getRepo()).updateReview(id, review);
  }
}
