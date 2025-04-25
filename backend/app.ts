import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./controller/user.routes";
import { expressjwt } from 'express-jwt';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.APP_PORT || 3000;

app.use(
  expressjwt({
      secret: process.env.JWT_SECRET || 'default_secret',
      algorithms: ['HS256'],
  }).unless({
      path: ['/status','/users/login', '/users/signup'],
  })
);

app.use("/users", userRouter);

app.get("/status", (req, res) => {
  res.json({ message: "Back-end is running..." });
});

app.listen(port || 3000, () => {
  console.log(`Back-end is running on port ${port}.`);
});
