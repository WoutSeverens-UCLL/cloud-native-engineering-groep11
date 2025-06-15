import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import OrderService from "@services/OrderService";
import PaymentService from "@services/PaymentService";
import { Order, Payment } from "types";
import {
  Badge,
  Calendar,
  DollarSign,
  Euro,
  Hash,
  Loader,
  Package,
  CheckCircle,
  Trophy,
} from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<{ [orderId: string]: Payment }>({});
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
      const response = await OrderService.getOrdersByUser(
        user.email,
        user.role
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data);

        // Fetch payments for all orders
        const paymentPromises = data.map(async (order: Order) => {
          try {
            const paymentResponse = await PaymentService.getPaymentsByOrderId(
              order.id as string
            );
            if (paymentResponse.ok) {
              const paymentData: Payment[] = await paymentResponse.json();
              return { orderId: order.id, payment: paymentData[0] || null };
            }
          } catch (error) {
            console.error(
              `Failed to fetch payment for order ${order.id}:`,
              error
            );
          }
          return { orderId: order.id, payment: null };
        });

        const paymentResults = await Promise.all(paymentPromises);
        const paymentsMap: { [orderId: string]: Payment } = {};
        paymentResults.forEach(({ orderId, payment }) => {
          if (payment) {
            paymentsMap[orderId] = payment;
          }
        });
        setPayments(paymentsMap);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOrderFullyCompleted = (order: Order) => {
    const payment = order.id ? payments[String(order.id)] : undefined;
    return order.status === "completed" && payment?.status === "paid";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-700" />
          <p className="text-gray-600 text-lg">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-purple-700" />
            <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your purchases
            </p>
          </div>

          {orders.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 mb-6">
                  When you place orders, they'll appear here
                </p>
                <button
                  onClick={() => router.push("/products")}
                  className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all"
                >
                  Start Shopping
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const fullyCompleted = isOrderFullyCompleted(order);
                const payment = order.id
                  ? payments[String(order.id)]
                  : undefined;

                return (
                  <Card
                    key={order.id}
                    className={`shadow-lg border-0 hover:shadow-xl transition-shadow relative ${
                      fullyCompleted
                        ? "border-t-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50"
                        : "border-t-4 border-purple-700"
                    }`}
                  >
                    {/* Completion Badge */}
                    {fullyCompleted && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          <Trophy className="h-4 w-4" />
                          Completed
                        </div>
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              Order #{order.id}
                            </span>
                            {fullyCompleted && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Euro className="h-4 w-4" />
                              <span className="font-medium">Total:</span>
                              <span
                                className={`font-semibold ${
                                  fullyCompleted
                                    ? "text-green-700"
                                    : "text-gray-900"
                                }`}
                              >
                                € {order.totalAmount}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                              <Package className="h-4 w-4" />
                              <span className="font-medium">Quantity:</span>
                              <span className="text-gray-900">
                                {order.orderQuantity}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Ordered:</span>
                              <span className="text-gray-900">
                                {order.createdAt
                                  ? formatDate(order.createdAt)
                                  : "Unknown"}
                              </span>
                            </div>
                          </div>

                          {/* Status indicators */}
                          <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Order Status:
                              </span>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-600"
                                    : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>

                            {payment && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  Payment:
                                </span>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    payment.status === "paid"
                                      ? "bg-green-100 text-green-600"
                                      : payment.status === "pending"
                                      ? "bg-yellow-100 text-yellow-600"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Completion message */}
                          {fullyCompleted && (
                            <div className="bg-green-100 border border-green-200 rounded-lg p-3 mt-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  Order delivered and payment completed
                                  successfully!
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-2">
                          <button
                            onClick={() =>
                              router.push(`/orders/detail/${order.id}`)
                            }
                            className={`font-semibold cursor-pointer px-4 py-2 rounded-md transition-colors ${
                              fullyCompleted
                                ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
                                : "bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white"
                            }`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
