import React, { useEffect, useState } from "react";
import { Review, User } from "types";
import ReviewService from "@services/ReviewService";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MessageSquare,
  Star,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Textarea } from "@components/ui/textarea";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@components/ui/collapsible";

interface Props {
  productId: string;
  userId: string;
  onAverageRatingUpdate?: (avg: number | null) => void;
}

const ReviewSection: React.FC<Props> = ({
  productId,
  userId,
  onAverageRatingUpdate,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await ReviewService.getReviewsByProductId(productId);
        const data = await response.json();
        setReviews(data);
        if (onAverageRatingUpdate) {
          const total = data.reduce(
            (sum: any, r: any) => sum + (r.rating || 0),
            0
          );
          const average = data.length > 0 ? total / data.length : null;
          onAverageRatingUpdate(average);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to load reviews. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const newReview = { productId, userId, rating, comment };

    try {
      const response = await ReviewService.createReview(newReview);
      const createdReview = await response.json();
      toast("Review submitted. Thank you for your feedback!");
      setReviews([createdReview, ...reviews]);
      if (onAverageRatingUpdate) {
        const updatedReviews = [createdReview, ...reviews];
        const total = updatedReviews.reduce(
          (sum, r) => sum + (r.rating || 0),
          0
        );
        const average = total / updatedReviews.length;
        onAverageRatingUpdate(average);
      }
      setShowReviewForm(false);
      setComment("");
      setRating(5);
    } catch (error) {
      console.error(error);
      toast("Error submitting review. Please try again later.");
    }
  };

  return (
    <div className="mt-16">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border border-gray-200 rounded-md "
      >
        <div className="flex items-center justify-between mb-6">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between text-left cursor-pointer"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                Reviews ({reviews.length})
              </h2>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </CollapsibleTrigger>
          {isOpen && loggedInUser && loggedInUser.role !== "seller" && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              className="flex items-center gap-2 border-purple-700 text-purple-700 hover:bg-purple-50 font-semibold cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              Write a review
            </Button>
          )}
        </div>

        <CollapsibleContent className="p-4">
          {showReviewForm && (
            <Card className="mb-8 border-purple-200">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="rating-star-1"
                      className="block text-sm font-semibold mb-2"
                    >
                      Rating
                    </label>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          id={star === 1 ? "rating-star-1" : undefined}
                          className={`h-6 w-6 cursor-pointer ${
                            rating >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {rating} out of 5 stars
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="comment"
                      className="block text-sm font-semibold mb-2"
                    >
                      Comment
                    </label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      className="min-h-[100px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                      className="font-semibold cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                    >
                      Submit Review
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-2">No reviews yet</p>
              <p className="text-gray-400 text-sm">
                Be the first to review this product
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <Card
                  key={review.id || index}
                  className="overflow-hidden border border-gray-200 shadow-sm py-0"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          {review.userId?.split(".")[0] ?? "Anonymous"}
                        </div>
                        <div className="flex items-center mb-1">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (review.rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {review.rating} out of 5 stars
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ReviewSection;
