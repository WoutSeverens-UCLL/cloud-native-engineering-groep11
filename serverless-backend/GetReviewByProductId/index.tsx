import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ReviewService } from "../service/review.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const productId = req.params.productId;

    if (!productId) {
      context.res = {
        status: 400,
        body: "Product ID is required",
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    const review = await ReviewService.getInstance().getReviewsByProductId(
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
      body: { error: error.message || "Invalid request" },
      headers: { "Content-Type": "application/json" },
    };
  }
};

export default httpTrigger;
