import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UserService } from "../service/user.service"



const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { email } = req.query;

  const user = await UserService.getInstance().deleteUser(email);

  if (!user) {
    context.res = {
      status: 404,
      body: "User not found"
    };
    return;
  }

  context.res = {
    body: user,
    headers: {
      "Content-Type": "application/json"
    }
  }
};

export default httpTrigger;