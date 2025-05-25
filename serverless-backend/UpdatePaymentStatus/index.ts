import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { PaymentService } from "../service/payment.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const { status } = req.body;

    const id = req.params.id;
    const orderId = req.params.orderId;

    const updatedPayment =
      await PaymentService.getInstance().updatePaymentStatus(
        id,
        orderId,
        status
      );

    context.res = {
      status: 200,
      body: updatedPayment,
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
