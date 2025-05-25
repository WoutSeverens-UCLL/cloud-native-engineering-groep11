import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { UserService } from "../service/user.service";
import { CustomError } from "../model/custom-error";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    if (!req.body) {
      throw CustomError.invalid("A valid request body is required.");
    }

    const user = req.body;
    const createdUser = await UserService.getInstance().createUser(user);

    context.res = {
      body: createdUser,
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
