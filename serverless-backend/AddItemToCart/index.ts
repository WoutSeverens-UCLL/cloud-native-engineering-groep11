import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CartService } from "../service/cart.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const userId = req.params.userId;

    const item = req.body;

    if (!item) {
      context.res = {
        status: 400,
        body: { error: "Item in request body is required" },
        headers: { "Content-Type": "application/json" },
      };
      return;
    }

    const updatedCart = await CartService.getInstance().addItemToCart(
      item,
      userId
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
