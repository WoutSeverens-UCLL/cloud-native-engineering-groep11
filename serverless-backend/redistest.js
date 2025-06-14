const { createClient } = require("redis");
const { DefaultAzureCredential } = require("@azure/identity");
require('dotenv').config();

async function returnPassword(credential) {
  const redisScope = "https://redis.azure.com/.default";

  // Fetch a Microsoft Entra token to be used for authentication. This token will be used as the password.
  return credential.getToken(redisScope);
}

async function main() {
  // Construct a Token Credential from Identity library, e.g. ClientSecretCredential / ClientCertificateCredential / ManagedIdentityCredential, etc.
  const credential = new DefaultAzureCredential();
  let accessToken = await returnPassword(credential);

  // Create redis client and connect to the Azure Cache for Redis over the TLS port using the access token as password.
  const cacheConnection = createClient({
    url: `rediss://${process.env.REDIS_HOST_NAME}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_ACCESS_KEY,
    socket: {
      tls: true,
    },
  });

  cacheConnection.on("error", (err) => console.log("Redis Client Error", err));
  await cacheConnection.connect();

  for (let i = 0; i < 3; i++) {
    try {
      // PING command
      console.log("\nCache command: PING");
      console.log("Cache response : " + (await cacheConnection.ping()));

      // SET
      console.log("\nCache command: SET Message");
      console.log(
        "Cache response : " +
          (await cacheConnection.set(
            "Message",
            "Hello! The cache is working from Node.js!"
          ))
      );

      // GET
      console.log("\nCache command: GET Message");
      console.log("Cache response : " + (await cacheConnection.get("Message")));

      // Client list, useful to see if connection list is growing...
      console.log("\nCache command: CLIENT LIST");
      console.log(
        "Cache response : " +
          (await cacheConnection.sendCommand(["CLIENT", "LIST"]))
      );
      break;
    } catch (e) {
      console.log("error during redis get", e.toString());
      if (
        accessToken.expiresOnTimestamp <= Date.now() ||
        redis.status === "end" ||
        "close"
      ) {
        await redis.disconnect();
        accessToken = await returnPassword(credential);
        cacheConnection = createClient({
          username: process.env.REDIS_SERVICE_PRINCIPAL_ID,
          password: accessToken.token,
          url: `redis://${process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME}:6380`,
          pingInterval: 100000,
          socket: {
            tls: true,
            keepAlive: 0,
          },
        });
      }
    }
  }
}

main()
  .then((result) => console.log(result))
  .catch((ex) => console.log(ex));
