import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ProductService } from "../service/product.service";
import { CustomError } from "../model/custom-error";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    if (!req.body) {
      throw CustomError.invalid("A valid request body is required.");
    }

    const product = req.body;
    const createdProduct = await ProductService.getInstance().createProduct(
      product
    );

    context.res = {
      body: createdProduct,
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
