import { Payment, PaymentStatus } from "types";

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

const updatePaymentStatus = (
  id: string,
  orderId: string,
  status: PaymentStatus
) => {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL + `/payments/${id}/${orderId}/status` + process.env.FK_PAYMENTS_UPDATE_STATUS,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    }
  );
};

// Enhanced payment processing function with card validation

const PaymentService = {
  createPayment,
  getPaymentsByOrderId,
  updatePaymentStatus,
};

export default PaymentService;
