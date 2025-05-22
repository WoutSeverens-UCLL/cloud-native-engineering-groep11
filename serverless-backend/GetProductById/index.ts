import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ProductService } from "../service/product.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const id = req.params.id;
    const sellerId = req.params.sellerId;

    if (!id || !sellerId) {
      context.res = {
        status: 400,
        body: { error: "Product ID and Seller ID are required" },
        headers: { "Content-Type": "application/json" },
      };
      return;
    }

    const product = await ProductService.getInstance().getProduct(id, sellerId);

    context.res = {
      body: product,
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
