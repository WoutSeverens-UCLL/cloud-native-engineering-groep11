import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CustomError } from "../model/custom-error";
import { CartService } from "../service/cart.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    if (!req.body) {
      throw CustomError.invalid("A valid request body is required.");
    }

    const cart = req.body;
    const createdCart = await CartService.getInstance().createCart(cart);

    context.res = {
      body: createdCart,
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
