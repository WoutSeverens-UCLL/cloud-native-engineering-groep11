import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ReviewService } from "../service/review.service";
import { CustomError } from "../model/custom-error";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    if (!req.body) {
      throw CustomError.invalid("A valid request body is required.");
    }

    const reviewId = req.params.id;

    if (!reviewId) {
      context.res = {
        status: 400,
        body: "Review ID is required",
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    const review = await ReviewService.getInstance().updateReview(
      reviewId,
      req.body
    );

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
