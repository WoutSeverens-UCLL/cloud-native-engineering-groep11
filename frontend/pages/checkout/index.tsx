import Header from "@components/header";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { useRouter } from "next/router";
import { useState } from "react";
import PaymentService from "@services/PaymentService";
import { toast } from "sonner";
import OrderService from "@services/OrderService";
import CartService from "@services/CartService";

const CheckoutPage = () => {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const loggedInUserString = sessionStorage.getItem("loggedInUser");
      if (!loggedInUserString) throw new Error("Not logged in");
      const user = JSON.parse(loggedInUserString);

      const cartResponse = await CartService.getCartByUserId(user.email);
      const cart = await cartResponse.json();

      const amount = cart.items.reduce(
        (total: number, item: any) => total + (item.price ?? 0) * item.quantity,
        0
      );

      const orderIds: string[] = [];

      for (const item of cart.items) {
        const loggedInUserString = sessionStorage.getItem("loggedInUser");
        const token = loggedInUserString
          ? JSON.parse(loggedInUserString).token
          : "";

        const sellerIdResponse = await fetch(
          `http://localhost:3000/products/seller/partitionkey/${item.productId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!sellerIdResponse.ok) {
          // Handle error or skip item
          continue;
        }
        const sellerData = await sellerIdResponse.json();
        const sellerId = sellerData.sellerId;

        const orderRes = await OrderService.createOrder({
          productId: item.productId,
          sellerId,
          buyerId: user.email,
          quantity: item.quantity,
          totalAmount: (item.price ?? 0) * item.quantity,
          status: "pending",
          createdAt: new Date().toISOString(),
        });

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          orderIds.push(orderData.id);
        }
      }

      const orderId = orderIds.join(",");

      await PaymentService.createPayment({
        orderId,
        amount,
        status: "pending",
        paymentMethod: "card",
        createdAt: new Date().toISOString(),
      });
      await CartService.clearItemFromCart(user.email);

      toast.success("Payment successful! Thank you for your purchase.");
      router.push("/thankyou");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Card Number</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Expiry</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">CVC</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-700 to-indigo-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Pay Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CheckoutPage;
