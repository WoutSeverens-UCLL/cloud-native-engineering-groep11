import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { PaymentService } from "../service/payment.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const payment = req.body;

    const createdPayment = await PaymentService.getInstance().createPayment(
      payment
    );

    context.res = {
      status: 201,
      body: createdPayment,
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
