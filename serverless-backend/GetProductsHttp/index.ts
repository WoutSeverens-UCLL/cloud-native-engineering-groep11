import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ProductService } from "../service/product.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const products = await ProductService.getInstance().getAllProducts();

  context.res = {
    body: products,
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export default httpTrigger;
