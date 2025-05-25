import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CartService } from "../service/cart.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const userId = req.params.userId;
    const itemId = req.params.itemId;

    const { quantity } = req.body;

    const updatedCart = await CartService.getInstance().updateQuantity(
      itemId,
      userId,
      quantity
    );
    context.res = {
      body: updatedCart,
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
