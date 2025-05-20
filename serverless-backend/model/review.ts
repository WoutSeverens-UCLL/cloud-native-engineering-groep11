export class Review {
  readonly id?: string;
  readonly productId: string;
  readonly userId: string;
  readonly rating: number;
  readonly comment: string;

  constructor(review: {
    id?: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
  }) {
    this.validate(review);
    this.id = review.id;
    this.productId = review.productId;
    this.userId = review.userId;
    this.rating = review.rating;
    this.comment = review.comment;
  }

  validate(review: {
    id?: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
  }) {
    if (!review.productId) throw new Error("Product ID is required");
    if (!review.userId) throw new Error("User ID is required");
    if (review.rating < 0 || review.rating > 5)
      throw new Error("Rating must be between 0 and 5");
    if (!review.comment) throw new Error("Comment is required");
  }

  equals({
    id,
    productId,
    userId,
    rating,
    comment,
  }: {
    id?: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
  }) {
    return (
      this.id === id &&
      this.productId === productId &&
      this.userId === userId &&
      this.rating === rating &&
      this.comment === comment
    );
  }
}
