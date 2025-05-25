import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import OrderService from "@services/OrderService";
import { Order } from "types";

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const loggedInUserString = sessionStorage.getItem("loggedInUser");
      if (!loggedInUserString) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(loggedInUserString);
      const response = await OrderService.getOrdersByUser(user.email, "buyer");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li key={order.id} className="border-b pb-2">
                    <div>
                      <span className="font-semibold">Order ID:</span>{" "}
                      {order.id}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{" "}
                      {order.status}
                    </div>
                    <div>
                      <span className="font-semibold">Total:</span> $
                      {order.totalAmount}
                    </div>
                    <div>
                      <span className="font-semibold">Created:</span>{" "}
                      {order.createdAt}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OrdersPage;
