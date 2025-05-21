import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UserService } from "../service/user.service"

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
//   const user = req.body;
  const user = await UserService.getInstance().createUser(req.body);

  context.res = {
    body: user,
    headers: {
      "Content-Type": "application/json"
    }
  }
};

export default httpTrigger;