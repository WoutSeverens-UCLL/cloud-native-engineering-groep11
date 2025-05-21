import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ProductService } from "../service/product.service"

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const product = await ProductService.getInstance().createProduct(req.body);

  context.res = {
    body: product,
    headers: {
      "Content-Type": "application/json"
    }
  }
};

export default httpTrigger;