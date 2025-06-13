import { createClient, RedisClientType } from "redis";

export class LinkCache {
  private static instance: LinkCache;
  private readonly cacheClient: RedisClientType<any, any>;

  private constructor(redisClient: RedisClientType<any, any>) {
    this.cacheClient = redisClient;
  }

  private static async createClient(): Promise<RedisClientType<any, any>> {
    const cacheHostName = process.env.REDIS_HOST_NAME;
    const cachePassword = process.env.REDIS_ACCESS_KEY;
    const cachePort = process.env.REDIS_PORT || "6380";

    if (!cacheHostName) throw new Error("REDIS_HOST_NAME is empty");
    if (!cachePassword) throw new Error("REDIS_ACCESS_KEY is empty");

    const cacheConnection = createClient({
      url: `rediss://${cacheHostName}:${cachePort}`,
      password: cachePassword,
      socket: {
        tls: true,
      },
    });

    cacheConnection.on("error", (err) => console.error("Redis Error:", err));

    await cacheConnection.connect();
    return cacheConnection;
  }

  static async getInstance(): Promise<LinkCache> {
    if (!this.instance) {
      const client = await this.createClient();
      this.instance = new LinkCache(client);
    } else if (!this.instance.cacheClient.isOpen) {
      try {
        await this.instance.cacheClient.connect();
      } catch (err) {
        console.error("Reconnecting Redis client...", err);
        this.instance = new LinkCache(await this.createClient());
      }
    }
    return this.instance;
  }

  async quit(): Promise<void> {
    await this.cacheClient.quit();
  }

  async setLinkMapping(link: string, mapping: string): Promise<void> {
    await this.cacheClient.set(mapping, link, {
      EX: 600,
    });
  }

  async getLinkMapping(mapping: string): Promise<string | null> {
    const value = await this.cacheClient.get(mapping);
    return typeof value === "string" ? value : null;
  }
}
