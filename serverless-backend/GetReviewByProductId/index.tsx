import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ReviewService } from "../service/review.service";



const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const productId = req.params.productId;
  const review = await ReviewService.getInstance().getReviewsByProductId(productId);

  if (!review) {
    context.res = {
      status: 404,
      body: "Review not found",
      headers: {
        "Content-Type": "application/json"
      }
    };
    return;
  }

  context.res = {
    body: review,
    headers: {
      "Content-Type": "application/json"
    }
  }
};

export default httpTrigger;