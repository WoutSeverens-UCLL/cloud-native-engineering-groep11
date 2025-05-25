import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ProductService } from "../service/product.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const id = req.params.id;

    if (!id) {
      context.res = {
        status: 400,
        body: { error: "Product Id is required" },
        headers: { "Content-Type": "application/json" },
      };
      return;
    }

    const sellerId =
      await ProductService.getInstance().getPartitionKeyForProduct(id);

    context.res = {
      status: 200,
      body: { sellerId },
      headers: { "Content-Type": "application/json" },
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
