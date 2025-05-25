import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OrderService } from "../service/order.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const id = req.params.id;

    const partitionKey =
      await OrderService.getInstance().getPartitionKeyForOrder(id);

    context.res = {
      body: { partitionKey },
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
