import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { UserService } from "../service/user.service";
import { CustomError } from "../model/custom-error";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      throw CustomError.invalid("A valid request body is required.");
    }

    const { email, password } = req.body;
    const authResponse = await UserService.getInstance().authenticate({
      email,
      password,
    });

    context.res = {
      body: authResponse,
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
