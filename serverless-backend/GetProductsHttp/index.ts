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
        headers: {
          "Location": cachedProducts,
          "SHOPY-LOCATION": "cache"
        },
      };
      return;
    } else {
      const products = await ProductService.getInstance().getAllProducts();
      await shopyCache.set(JSON.stringify(products), cacheKey);

      context.res = {
        status: 200,
        headers: {
          "Location": products,
          "SHOPY-LOCATION": "db"
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
