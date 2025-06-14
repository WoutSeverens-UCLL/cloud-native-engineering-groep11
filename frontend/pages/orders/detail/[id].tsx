import { useEffect, useState, useMemo } from "react"; // Import useMemo
import {
  Loader,
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  User,
  Clock,
  Euro,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/router";
import { Order, OrderStatus, Payment, Product } from "types"; // Make sure OrderStatus and PaymentStatus are correctly imported if needed elsewhere
import { toast } from "sonner";
import OrderService from "@services/OrderService";
import PaymentService from "@services/PaymentService";
import Header from "@components/header";
import { Button } from "@components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { cn } from "@components/lib/utils";

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [rawProducts, setRawProducts] = useState<Product[] | null>(null); // Store raw products from backend
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const fetchOrderAndPaymentDetails = async () => {
    setIsLoading(true);
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (!loggedInUserString) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(loggedInUserString);
    setLoggedInUser(user);

    if (!id) {
      toast.error("Order ID not found");
      router.push("/orders");
      return;
    }

    try {
      const response = await OrderService.getPartitionKeyForOrder(id as string);
      const buyerIdData = await response.json();

      const orderResponse = await OrderService.getOrder(
        id as string,
        buyerIdData.partitionKey
      );
      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        setOrder(orderData);

        const productResponse = await OrderService.getProductsByOrderId(
          id as string
        );
        if (productResponse.ok) {
          const productData = await productResponse.json();
          // Store the raw product list from the backend
          setRawProducts(productData);
        } else {
          console.warn(
            `Failed to fetch product details for order ${orderData.id}`
          );
          toast.error(
            `Could not load product details for order ${orderData.id}`
          );
        }

        const paymentResponse = await PaymentService.getPaymentsByOrderId(
          id as string
        );
        if (paymentResponse.ok) {
          const paymentData: Payment[] = await paymentResponse.json();
          if (paymentData.length > 0) {
            setPayment(paymentData[0]);
          }
        }
      } else {
        toast.error("Order not found or access denied");
        router.push("/orders");
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndPaymentDetails();
  }, [id, router]);

  // Use useMemo to aggregate products and their quantities

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCardNumber = (cardNumber?: string) => {
    if (!cardNumber) return "N/A";
    const visibleDigits = 4;
    if (cardNumber.length <= visibleDigits) {
      return cardNumber;
    }
    const maskedPart = "*".repeat(cardNumber.length - visibleDigits);
    const lastFourDigits = cardNumber.slice(-visibleDigits);
    return `${maskedPart}${lastFourDigits}`;
  };

  const handleOrderStatusUpdate = async (newStatus: OrderStatus) => {
    setIsLoading(true);
    try {
      if (order && order.id && order.buyerId) {
        await OrderService.updateOrderStatus(
          order.id,
          order.buyerId,
          newStatus
        );
        toast.success(`Order status updated to ${newStatus}.`);
        await fetchOrderAndPaymentDetails();
      } else {
        toast.error("Order information is incomplete.");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentStatus = async () => {
    setIsLoading(true);
    try {
      if (payment && payment.id && order && order.id) {
        await PaymentService.updatePaymentStatus(payment.id, order.id, "paid");
        toast.success("Payment status updated to paid.");
        await fetchOrderAndPaymentDetails();
      } else {
        toast.error("Payment information is incomplete.");
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status.");
    } finally {
      setIsLoading(false);
    }
  };

  function capitalizeFirstLetter(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Calculate total amount for the order
  const totalAmount = useMemo(() => {
    if (!rawProducts) return 0;
    return rawProducts.reduce(
      (sum, product) =>
        sum + (product.price ?? 0) * (product.productQuantity ?? 1),
      0
    );
  }, [rawProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-700" />
            <p className="text-gray-600 text-lg font-medium">
              Loading order details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The order you are looking for does not exist or you don't have
              access to it.
            </p>
            <Button asChild>
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/orders")}
            className="mb-6 text-purple-700 hover:text-purple-800 hover:bg-purple-100 cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.id}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-0 border-t-4 border-t-purple-700 bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-700" />
                    <span>Order Details</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium",
                      order.status === "completed"
                        ? "bg-green-100 text-green-600 font-semibold"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-600 font-semibold"
                        : "bg-gray-100 text-gray-600 font-semibold"
                    )}
                  >
                    {order.status}
                  </span>
                  {order.status === "pending" &&
                    loggedInUser?.role === "seller" && (
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer"
                        onClick={() => handleOrderStatusUpdate("shipped")}
                      >
                        Mark as Shipped
                      </Button>
                    )}
                  {order.status === "shipped" &&
                    loggedInUser?.role === "buyer" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer"
                        onClick={() => handleOrderStatusUpdate("completed")}
                      >
                        Order Arrived
                      </Button>
                    )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Products Section with individual quantities */}
                  {rawProducts && rawProducts.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">Products Ordered</p>
                      {rawProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            {product.images && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 flex items-center gap-2">
                                {product.name}
                                <span className="text-sm text-gray-500">
                                  x{product.productQuantity}
                                </span>
                              </p>
                              {(product.productColor ||
                                product.productSize) && (
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                                  {product.productColor && (
                                    <span className="flex items-center gap-1">
                                      <span
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{
                                          backgroundColor: product.productColor,
                                        }}
                                      />
                                      {capitalizeFirstLetter(
                                        product.productColor
                                      )}
                                    </span>
                                  )}
                                  {product.productSize && (
                                    <span
                                      className="
    min-w-[1.5rem] 
    px-2 
    h-6 
    flex 
    items-center 
    justify-center 
    border 
    border-gray-300 
    rounded-full 
    text-xs 
    font-semibold 
    text-gray-700
  "
                                    >
                                      {product.productSize}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-900">
                              €{" "}
                              {(
                                (product.price ?? 0) *
                                (product.productQuantity ?? 1)
                              ).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      ))}

                      {/* Total Amount in dezelfde container, rechts uitgelijnd */}
                      <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-500 font-semibold">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          <Euro className="inline-block h-6 w-6 mr-1 -mt-1" />{" "}
                          {order.totalAmount?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            {payment && (
              <Card className="shadow-sm border-0 border-t-4 border-t-purple-700 bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-purple-700" />
                      <span>Payment Details</span>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-sm font-medium",
                        payment.status === "paid"
                          ? "bg-green-100 text-green-600 font-semibold"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-600 font-semibold"
                          : "bg-red-100 text-red-600 font-semibold"
                      )}
                    >
                      {payment.status}
                    </span>
                    {payment.status !== "paid" &&
                      loggedInUser?.role === "seller" && (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer"
                          onClick={handlePaymentStatus}
                        >
                          Mark as Paid
                        </Button>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {payment.paymentMethod &&
                      payment.cardDetails &&
                      payment.billingAddress &&
                      payment.shippingAddress && (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                              Payment Method
                            </p>
                            <p className="font-semibold text-gray-900">
                              {payment.paymentMethod.toUpperCase()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Card Holder</p>
                            <p className="font-semibold text-gray-900">
                              {payment.cardDetails.cardHolderName?.toUpperCase()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Expires</p>
                            <p className="font-semibold text-gray-900">
                              {payment.cardDetails.expiryDate}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Card Number</p>
                            <p className="font-semibold text-gray-900">
                              {formatCardNumber(payment.cardDetails.cardNumber)}
                            </p>
                          </div>
                          <div className="space-y-1 ">
                            <p className="text-sm text-gray-500">
                              Billing Address
                            </p>
                            <p className="font-semibold text-gray-900">
                              {payment.billingAddress}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                              Shipping Address
                            </p>
                            <p className="font-semibold text-gray-900">
                              {payment.shippingAddress}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            {payment && loggedInUser.role === "seller" && (
              <Card className="shadow-sm border-0 border-t-4 border-t-purple-700 bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-purple-700" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-semibold text-gray-900">
                        {payment.firstName} {payment.lastName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">
                        {payment.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {payment && loggedInUser.role === "buyer" && (
              <Card className="shadow-sm border-0 border-t-4 border-t-purple-700 bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-purple-700" />
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-semibold text-gray-900">
                        {order.sellerId?.split("@")[0].replace(/\./g, " ")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">
                        {order.sellerId}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Timeline */}
            <Card className="shadow-sm border-0 border-t-4 border-t-purple-700 bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-purple-700" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-700 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Order Placed
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {payment?.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-700 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Payment Sent
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {payment?.paidAt && payment.status === "paid" && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-700 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Payment Received
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(payment.paidAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {order?.updatedAt && order.status === "shipped" && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-700 rounded-full"></div>{" "}
                      {/* Changed color for shipped */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Order Shipped
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.status === "completed" && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-700 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Order Completed
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
