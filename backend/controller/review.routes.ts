import { Router, Request, Response, NextFunction } from "express";
import { ReviewService } from "../service/review.service";
import { Review } from "../model/review";

const reviewRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Review
 *   description: Review management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         productId:
 *           type: string
 *         userId:
 *           type: string
 *         rating:
 *           type: number
 *           format: float
 *         comment:
 *           type: string
 *       required:
 *         - productId
 *         - userId
 *         - rating
 *         - comment
 *       example:
 *         productId: "1234567890abcdef12345678"
 *         userId: "1234567890abcdef12345678"
 *         rating: 4.5
 *         comment: "Great product!"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
reviewRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await ReviewService.getInstance().getAllReviews();
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
reviewRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await ReviewService.getInstance().getReview(req.params.id);
      res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Bad request
 */
reviewRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = new Review(req.body);
      const createdReview = await ReviewService.getInstance().createReview(
        review
      );
      res.status(201).json(createdReview);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review by ID
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Review not found
 */
reviewRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = new Review(req.body);
      const updatedReview = await ReviewService.getInstance().updateReview(
        req.params.id,
        review
      );
      res.status(200).json(updatedReview);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review by ID
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
reviewRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedReview = await ReviewService.getInstance().deleteReview(
        req.params.id
      );
      res.status(200).json(deletedReview);
    } catch (error) {
      next(error);
    }
  }
);

export { reviewRouter };
