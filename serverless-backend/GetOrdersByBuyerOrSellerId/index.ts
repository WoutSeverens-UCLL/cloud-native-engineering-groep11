import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OrderService } from "../service/order.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const { role, userId } = req.params;
    let orders;

    if (role === "buyer") {
      orders = await OrderService.getInstance().getOrdersByBuyerId(userId);
    } else if (role === "seller") {
      orders = await OrderService.getInstance().getOrdersBySellerId(userId);
    } else {
      context.res = {
        status: 400,
        body: { message: "Invalid role" },
        headers: { "Content-Type": "application/json" },
      };
      return;
    }

    context.res = {
      body: orders,
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
