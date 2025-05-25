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
        body: "Review ID and Product ID are required",
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    const review = await ReviewService.getInstance().deleteReview(
      reviewId,
      productId
    );

    context.res = {
      body: review,
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error: any) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "Review not found" },
        headers: { "Content-Type": "application/json" },
      };
    } else {
      context.res = {
        status: 400,
        body: { error: error.message || "Invalid request" },
        headers: { "Content-Type": "application/json" },
      };
    }
  }
};

export default httpTrigger;
