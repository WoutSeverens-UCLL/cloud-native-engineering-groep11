import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ProductService } from "../service/product.service";
import { ShopyCache } from "../repository/redis-shopy-cache";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const shopyCache = await ShopyCache.getInstance();
    const cacheKey = "products";

    const cachedProducts = await shopyCache.get(cacheKey);

    if (cachedProducts) {
      context.res = {
        status: 200,
        body: JSON.parse(cachedProducts),
        headers: {
          "Content-Type": "application/json",
          "SHOPY-LOCATION": "cache",
        },
      };
      return;
    } else {
      const products = await ProductService.getInstance().getAllProducts();
      await shopyCache.set(cacheKey, JSON.stringify(products));

      context.res = {
        status: 200,
        body: products,
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
