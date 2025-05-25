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

    const review = req.body;
    const createdReview = await ReviewService.getInstance().createReview(
      review
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
