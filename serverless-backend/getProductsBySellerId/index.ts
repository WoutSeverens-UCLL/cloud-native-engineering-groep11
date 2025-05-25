import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ProductService } from "../service/product.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const sellerId = req.params.sellerId;

    if (!sellerId) {
      context.res = {
        status: 400,
        body: "Seller ID is required",
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    const products = await ProductService.getInstance().getProductsBySellerId(
      sellerId
    );

    if (!products || products.length === 0) {
      context.res = {
        status: 404,
        body: "Products not found",
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    context.res = {
      body: products,
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
