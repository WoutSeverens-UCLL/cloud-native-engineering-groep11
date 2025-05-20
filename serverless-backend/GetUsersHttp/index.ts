import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { UserService } from "../service/user.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const users = await UserService.getInstance().getAllUsers();

    context.res = {
      status: 200,
      body: users,
      headers: {
        "Content-Type": "application/json"
      }
    };
  } catch (error) {
    context.log.error("Failed to get users:", error);

    context.res = {
      status: 500,
      body: {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};

export default httpTrigger;