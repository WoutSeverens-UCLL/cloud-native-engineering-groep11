import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CartService } from "../service/cart.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const userId = req.params.userId;

    if (!userId) {
      context.res = {
        status: 400,
        body: { message: "User ID is required" },
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    const carts = await CartService.getInstance().getCartByUserId(userId);

    if (!carts) {
      context.res = {
        status: 404,
        body: { message: "Cart not found" },
        headers: {
          "Content-Type": "application/json",
        },
      };
      return;
    }

    context.res = {
      body: carts,
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error: any) {
    context.res = {
      status: 400,
      body: { error: error.message || "Invalid request" },
      headers: {
        "Content-Type": "application/json",
      },
    };
    return;
  }
};

export default httpTrigger;
