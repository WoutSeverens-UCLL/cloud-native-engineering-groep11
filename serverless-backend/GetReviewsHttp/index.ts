import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ReviewService } from "../service/review.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const reviews = await ReviewService.getInstance().getAllReviews();

  context.res = {
    body: reviews,
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export default httpTrigger;
