import { createClient } from "redis";

interface RedisProxyInterface {
  set: (key: string, value: string, options?: {}) => Promise<string>;
  get: (key: string) => Promise<string>;
  quit: () => Promise<string>;
  isOpen: boolean;
  isReady: boolean;
  connect: () => Promise<unknown>;
}

// Environment variables for cache
export class ShopyCache {
  private static instance: ShopyCache;

  private readonly cacheClient: RedisProxyInterface;

  private constructor(redisClient: RedisProxyInterface) {
    if (!redisClient) {
      throw new Error("A Redis client is required.");
    }
    this.cacheClient = redisClient;
  }

  private static async createClient() {
    const cacheHostName = process.env.REDIS_HOST_NAME;
    const cachePassword = process.env.REDIS_ACCESS_KEY;
    const cachePort = process.env.REDIS_PORT || "6380";

    if (!cacheHostName) throw Error("REDIS_HOST_NAME is empty");
    if (!cachePassword) throw Error("REDIS_ACCESS_KEY is empty");

    const cacheConnection = createClient({
      url: `rediss://${cacheHostName}:${cachePort}`,
      password: cachePassword,
    });

    await cacheConnection.connect();
    return cacheConnection;
  }

  static async getInstance() {
    if (!this.instance) {
      const cacheConnection = await this.createClient();
      this.instance = new ShopyCache(cacheConnection);
    } else {
      if (
        !this.instance.cacheClient.isOpen ||
        !this.instance.cacheClient.isReady
      ) {
        try {
          await this.instance.cacheClient.connect();
        } catch (error) {
          console.error(error);
          this.instance = new ShopyCache(await this.createClient());
        }
      }
    }
    return this.instance;
  }

  async quit() {
    await this.cacheClient.quit();
  }

  async get(key: string) {
    return await this.cacheClient.get(key);
  }

  async set(key: string, value: string) {
    return await this.cacheClient.set(key, value, { EX: 600 });
  }
}
