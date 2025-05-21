import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { UserService } from "../service/user.service"


const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { email, password } = req.body;
  const authResponse = await UserService.getInstance().authenticate({ email, password });

  context.res = {
    body: authResponse,
    headers: {
      "Content-Type": "application/json"
    }
  }
};

export default httpTrigger;