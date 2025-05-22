import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ProductService } from "../service/product.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const users = await ProductService.getInstance().getAllProducts();

    context.res = {
      body: users,
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
