import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { PaymentService } from "../service/payment.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const payment = await PaymentService.getInstance().getPayment(
      req.params.id,
      req.params.orderId
    );

    context.res = {
      body: payment,
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
