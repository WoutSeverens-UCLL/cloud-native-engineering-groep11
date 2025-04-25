import { Router, Request, Response, NextFunction } from "express";
import { UserService } from "../service/user.service";
import { UserInput } from "../types";
import { User } from "../model/user";

const userRouter = Router();

userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserService.getInstance().getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

userRouter.get(
  "/:email",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.params.email;
      const user = await UserService.getInstance().getUser(email);
      res.status(200).json(user);
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred";
      res.status(400).json({ status: "error", errorMessage: errorMessage });
    }
  }
);

userRouter.get(
  "/delete/:email",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.params.email;
      const user = await UserService.getInstance().deleteUser(email);
      res.status(200).json(user);
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred";
      res.status(400).json({ status: "error", errorMessage: errorMessage });
    }
  }
);

userRouter.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userInput = <UserInput>req.body;
      const user = new User(userInput);
      const createdUser = await UserService.getInstance().createUser(user);
      res.status(200).json(createdUser);
    } catch (error) {
      next(error);
    }
  }
);

export default userRouter;