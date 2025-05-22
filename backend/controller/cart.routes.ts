/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - userId
 *         - updatedAt
 *       example:
 *         id: "12345"
 *         userId: "user123"
 *         items:
 *           - productId: "prod123"
 *             quantity: 2
 *             price: 19.99
 *         updatedAt: "2025-10-01T12:00:00Z"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

import { NextFunction, Request, Response, Router } from "express";
import { Cart } from "../model/cart.model";
import { CartService } from "../service/cart.service";

const cartRouter = Router();

/**
 * @swagger
 * /carts:
 *   post:
 *     summary: Create a new cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cart'
 *     responses:
 *       201:
 *         description: The created product
 */

cartRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = new Cart(req.body);
      const createdCart = await CartService.getInstance().createCart(cart);
      res.status(201).json(createdCart);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carts/{id}/{userId}:
 *   get:
 *     summary: Get a cart by ID
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A single cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

cartRouter.get(
  "/:id/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await CartService.getInstance().getCart(
        req.params.id,
        req.params.userId
      );
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carts/{userId}:
 *   get:
 *     summary: Get cart by user ID
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A single cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

cartRouter.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await CartService.getInstance().getCartByUserId(
        req.params.userId
      );
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carts/{userId}/items:
 *   patch:
 *     summary: Add an item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       200:
 *         description: Cart with added item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */
cartRouter.patch(
  "/:userId/items",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.params.userId) {
        throw new Error("User ID is invalid");
      }
      const item = req.body;
      const updatedCart = await CartService.getInstance().addItemToCart(
        item,
        req.params.userId
      );
      res.status(200).json(updatedCart);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carts/{userId}/items/{itemId}:
 *   patch:
 *     summary: Remove an item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to remove
 *     responses:
 *       200:
 *         description: Cart with item removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart or item not found
 *       500:
 *         description: Internal server error
 */
cartRouter.patch(
  "/:userId/items/:itemId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.params.userId || !req.params.itemId) {
        throw new Error("User ID and item ID are required");
      }
      const updatedCart = await CartService.getInstance().removeItemFromCart(
        req.params.itemId,
        req.params.userId
      );
      res.status(200).json(updatedCart);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carts/{userId}/items/all/clear:
 *   patch:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Cart with all items cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
cartRouter.patch(
  "/:userId/items/all/clear",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.params.userId) {
        throw new Error("User ID is invalid");
      }
      const clearedCart = await CartService.getInstance().clearItemsFromCart(
        req.params.userId
      );
      res.status(200).json(clearedCart);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /carts/{userId}/items/{itemId}/quantity:
 *   patch:
 *     summary: Update the quantity of an item in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: The new quantity
 *                 minimum: 1
 *             required:
 *               - quantity
 *     responses:
 *       200:
 *         description: Cart with updated item quantity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: Cart or item not found
 *       500:
 *         description: Internal server error
 */
cartRouter.patch(
  "/:userId/items/:itemId/quantity",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.params.userId || !req.params.itemId) {
        throw new Error("User ID and item ID are required");
      }
      const { quantity } = req.body;
      if (!quantity || quantity <= 0) {
        throw new Error("Quantity must be a positive number");
      }
      const updatedCart = await CartService.getInstance().updateQuantity(
        req.params.itemId,
        req.params.userId,
        quantity
      );
      res.status(200).json(updatedCart);
    } catch (error) {
      next(error);
    }
  }
);

export default cartRouter;
