import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { UserService } from "../service/user.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const email = req.params.email;

    const user = await UserService.getInstance().deleteUser(email);

    context.res = {
      body: user,
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error: any) {
    if (error.code === 404) {
      context.res = {
        status: 404,
        body: { error: "User not found" },
        headers: { "Content-Type": "application/json" },
      };
    } else {
      context.res = {
        status: 400,
        body: { error: error.message || "Invalid request" },
        headers: { "Content-Type": "application/json" },
      };
    }
  }
};

export default httpTrigger;
