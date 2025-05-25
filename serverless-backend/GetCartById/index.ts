import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CartService } from "../service/cart.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const cartId = req.params.cartId;
    const userId = req.params.userId;

    if (!cartId || !userId) {
      context.res = {
        status: 400,
        body: "Cart ID and User ID are required",
      };
      return;
    }

    const cart = await CartService.getInstance().getCart(cartId, userId);

    if (!cart) {
      context.res = {
        status: 404,
        body: "Cart not found",
      };
      return;
    }

    context.res = {
      body: cart,
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
