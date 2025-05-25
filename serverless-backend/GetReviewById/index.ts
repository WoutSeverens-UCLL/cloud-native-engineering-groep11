import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ReviewService } from "../service/review.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const reviewId = req.params.id;
    const productId = req.params.productId;

    if (!reviewId || !productId) {
      context.res = {
        status: 400,
        body: "reviewId and productId are required",
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    const review = await ReviewService.getInstance().getReview(
      reviewId,
      productId
    );

    if (!review) {
      context.res = {
        status: 404,
        body: "Review not found",
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    context.res = {
      body: review,
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error: any) {
    context.res = {
      status: 400,
      body: "Invalid request",
      headers: {
        "Content-Type": "application/json",
      },
    };
    return;
  }
};

export default httpTrigger;
