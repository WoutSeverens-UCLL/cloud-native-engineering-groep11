import { Router, Request, Response, NextFunction } from "express";
import { UserService } from "../service/user.service";
import { UserInput } from "../types";
import { User } from "../model/user";

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and authentication
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique user ID
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - role
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserService.getInstance().getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Get a user by email
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
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

/**
 * @swagger
 * /users/delete/{email}:
 *   get:
 *     summary: Delete a user by email
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted user info
 */
userRouter.delete(
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

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
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

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auth response
 */
userRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const authresponse = await UserService.getInstance().authenticate({
        email,
        password,
      });
      res.status(200).json(authresponse);
    } catch (error) {
      next(error);
    }
  }
);

export default userRouter;
