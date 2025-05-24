import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { Order } from "../model/order";
import { OrderStatus } from "../types";
import { OrderService } from "../service/order.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const { orderId, buyerId } = req.params;
    const { status } = req.body as { status: OrderStatus };

    const updatedOrder = await OrderService.getInstance().updateOrderStatus(
      orderId,
      buyerId,
      status
    );

    context.res = {
      body: updatedOrder,
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
