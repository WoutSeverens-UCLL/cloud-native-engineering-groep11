import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ReviewService } from "../service/review.service";


const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const review = await ReviewService.getInstance().createReview(req.body);

  context.res = {
    body: review,
    headers: {
      "Content-Type": "application/json"
    }
  }
};

export default httpTrigger;