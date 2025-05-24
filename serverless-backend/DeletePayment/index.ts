import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { PaymentService } from "../service/payment.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const id = req.params.id;
    const orderId = req.params.orderId;

    const payment = await PaymentService.getInstance().deletePayment(
      id,
      orderId
    );

    context.res = {
      status: 200,
      body: undefined,
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
