import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ProductService } from "../service/product.service";
import { ShopyCache } from "../repository/redis-shopy-cache";
import { UserService } from "../service/user.service";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const shopyCache = await ShopyCache.getInstance();
    const cacheKey = "users";

    const cachedUsers = await shopyCache.get(cacheKey);

    if (cachedUsers) {
      context.res = {
        status: 200,
        body: JSON.parse(cachedUsers),
        headers: {
          "Content-Type": "application/json",
          "SHOPY-LOCATION": "cache",
        },
      };
      return;
    } else {
      const users = await UserService.getInstance().getAllUsers();
      await shopyCache.set(cacheKey, JSON.stringify(users));

      context.res = {
        status: 200,
        body: users,
        headers: {
          "Content-Type": "application/json",
          "SHOPY-LOCATION": "db",
        },
      };
    }

    await shopyCache.quit();
  } catch (error: any) {
    context.res = {
      status: 400,
      body: { error: error.message || "Invalid request" },
      headers: { "Content-Type": "application/json" },
    };
  }
};

export default httpTrigger;
