import { Review } from "types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const createReview = (review: Review) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(review),
  });
};

const getReviewsByProductId = (productId: string) => {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${productId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

const ReviewService = {
  createReview,
  getReviewsByProductId,
};

export default ReviewService;
