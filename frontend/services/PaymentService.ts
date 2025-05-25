import { Payment } from "types";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

// For simulation purposes, we'll store payments in session storage
const createPayment = (payment: Payment) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/payments" +
      process.env.FK_PAYMENTS_CREATE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payment),
    }
  );
};

const getPaymentsByOrderId = (orderId: string) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/payments/order/${orderId}` +
      process.env.FK_PAYMENTS_GET_BY_ORDER_ID,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

// Enhanced payment processing function with card validation
const processPayment = (
  paymentId: string,
  isSuccessful: boolean = true
): Promise<Payment | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const paymentsString = sessionStorage.getItem("payments");
      if (!paymentsString) {
        resolve(null);
        return;
      }

      const payments = JSON.parse(paymentsString);
      const paymentIndex = payments.findIndex(
        (p: Payment) => p.id === paymentId
      );

      if (paymentIndex === -1) {
        resolve(null);
        return;
      }

      payments[paymentIndex].status = isSuccessful ? "paid" : "failed";
      payments[paymentIndex].paidAt = isSuccessful
        ? new Date().toISOString()
        : undefined;

      sessionStorage.setItem("payments", JSON.stringify(payments));

      resolve(payments[paymentIndex]);
    }, 800); // Longer delay to simulate payment processing
  });
};

// Validate card details (simple simulation)
const validateCardDetails = (
  cardNumber: string,
  expiryDate: string,
  cvv: string
): Promise<{ valid: boolean; message?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Remove spaces and non-digits
      const cleanCardNumber = cardNumber.replace(/\D/g, "");
      const cleanCvv = cvv.replace(/\D/g, "");

      // Basic validation
      if (cleanCardNumber.length < 15) {
        resolve({ valid: false, message: "Invalid card number" });
        return;
      }

      if (cleanCvv.length < 3) {
        resolve({ valid: false, message: "Invalid CVV" });
        return;
      }

      // Parse expiry date (MM/YY)
      const [monthStr, yearStr] = expiryDate.split("/");
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10) + 2000; // Convert to 20YY

      // Check if card is expired
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (
        year < currentYear ||
        (year === currentYear && month < currentMonth)
      ) {
        resolve({ valid: false, message: "Card expired" });
        return;
      }

      // For demo purposes, let's have some "declined" cards
      // Cards ending with "0000" will be declined
      if (cleanCardNumber.endsWith("0000")) {
        resolve({ valid: false, message: "Card declined" });
        return;
      }

      resolve({ valid: true });
    }, 600);
  });
};

const PaymentService = {
  createPayment,
  getPaymentsByOrderId,
  processPayment,
  validateCardDetails,
};

export default PaymentService;
