import { Router, Request, Response, NextFunction } from "express";
import { ProductService } from "../service/product.service";
import { Product } from "../model/product";

const productRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         brand:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: number
 *           format: float
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *         category:
 *           type: string
 *         stock:
 *           type: number
 *         features:
 *           type: array
 *           items:
 *             type: string
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 format: float
 *               comment:
 *                 type: string
 *         sellerId:
 *           type: string
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - stock
 *       example:
 *         name: "Sample Product"
 *         description: "This is a sample product."
 *         price: 19.99
 *         category: "electronics"
 *         stock: 100
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await ProductService.getInstance().getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /products/{id}/{sellerId}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The seller ID
 *     responses:
 *       200:
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
productRouter.get(
  "/:id/:sellerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.getInstance().getProduct(
        req.params.id,
        req.params.sellerId
      );
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The created product
 */
productRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = new Product(req.body);
      const createdProduct = await ProductService.getInstance().createProduct(
        product
      );
      res.status(201).json(createdProduct);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *
 */
productRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = new Product({ ...req.body, id: req.params.id });
      const updatedProduct = await ProductService.getInstance().updateProduct(
        req.params.id,
        product
      );
      res.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /products/{id}/{sellerId}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The seller ID
 *     responses:
 *       200:
 *         description: The deleted product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
productRouter.delete(
  "/:id/:sellerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedProduct = await ProductService.getInstance().deleteProduct(
        req.params.id,
        req.params.sellerId
      );
      res.status(200).json(deletedProduct);
    } catch (error) {
      next(error);
    }
  }
);

productRouter.get(
  "/:sellerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await ProductService.getInstance().getProductsBySellerId(
        req.params.sellerId
      );
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /products/seller/{id}:
 *   get:
 *     summary: Get seller ID by product ID
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The seller ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sellerId:
 *                   type: string
 *                   example: "abc123"
 */

productRouter.get(
  "/seller/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId =
        await ProductService.getInstance().getPartitionKeyForProduct(
          req.params.id
        );
      res.status(200).json({ sellerId });
    } catch (error) {
      next(error);
    }
  }
);

export default productRouter;

