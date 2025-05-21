import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { UserService } from "../service/user.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const { email } = req.query;

    const user = await UserService.getInstance().getUser(email);

    if (!user) {
      context.res = {
        status: 404,
        body: { error: "User not found" },
        headers: { "Content-Type": "application/json" },
      };
      return;
    }

    context.res = {
      body: user,
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
