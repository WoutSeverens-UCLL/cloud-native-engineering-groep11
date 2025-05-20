import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./controller/user.routes";
import { expressjwt } from "express-jwt";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import productRouter from "./controller/product.routes";
import { reviewRouter } from "./controller/review.routes";
import { orderRouter } from "./controller/order.routes";
import { paymentRouter } from "./controller/payment.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.APP_PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shoppingcarts API",
      version: "1.0.0",
    },
  },
  apis: ["./controller/*.routes.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  expressjwt({
    secret: process.env.JWT_SECRET || "default_secret",
    algorithms: ["HS256"],
  }).unless({
    path: [
      "/api-docs",
      /^\/api-docs\/.*/,
      "/status",
      "/users/login",
      "/users/signup",
    ],
  })
);

app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/reviews", reviewRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);

app.get("/status", (req, res) => {
  res.json({ message: "Back-end is running..." });
});

app.listen(port || 3000, () => {
  console.log(`Back-end is running on port ${port}.`);
});
