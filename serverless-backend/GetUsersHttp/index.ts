import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UserService } from "../service/user.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const users = await UserService.getInstance().getAllUsers();

  context.res = {
    body: users,
    headers: {
      "Content-Type": "application/json"
    }
  }
};

export default httpTrigger;