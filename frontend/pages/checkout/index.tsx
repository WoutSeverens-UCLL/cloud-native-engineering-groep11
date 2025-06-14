import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Lock, MapPin, ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/router";
import CartService from "@services/CartService";
import ProductService from "@services/ProductService"; // Still needed to get seller info for products
import OrderService from "@services/OrderService";
import { Order, Payment, Product } from "types"; // Import Product type
import PaymentService from "@services/PaymentService";
import { toast } from "sonner";
import Header from "@components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";

// Define the form schema
const checkoutSchema = z.object({
  cardNumber: z
    .string()
    .min(15, "Card number must be at least 15 digits")
    .max(19, "Card number must not exceed 19 digits")
    .regex(/^[0-9\s-]+$/, "Invalid card number format"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvc: z
    .string()
    .min(3, "CVC must be 3-4 digits")
    .max(4, "CVC must be 3-4 digits")
    .regex(/^\d+$/, "CVC must contain only digits"),
  cardName: z.string().min(2, "Cardholder name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  billingAddress: z.string().min(5, "Billing address is required"),
  shippingAddress: z.string().min(5, "Shipping address is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: "",
      expiry: "",
      cvc: "",
      cardName: "",
      firstName: "",
      lastName: "",
      billingAddress: "",
      shippingAddress: "",
      email: "",
    },
  });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handlePayment = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      const loggedInUserString = sessionStorage.getItem("loggedInUser");
      if (!loggedInUserString) {
        throw new Error("Not logged in");
      }
      const user = JSON.parse(loggedInUserString);

      const cartRaw = sessionStorage.getItem("cart");
      if (!cartRaw) {
        throw new Error("Cart is empty");
      }

      let cart;
      try {
        cart = JSON.parse(cartRaw);
      } catch {
        throw new Error("Cart data is corrupted");
      }

      console.log("Cart items:", cart.items);

      if (!Array.isArray(cart.items) || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      // Prepare products for the single order
      const orderProducts: Product[] = [];
      let totalAmount = 0;
      let totalQuantity = 0;
      let sellerId: string | undefined; // Assuming all products in a cart belong to the same seller for a single order

      for (const item of cart.items) {
        const partitionkeyResponse =
          await ProductService.getPartitionKeyForProduct(item.productId);
        if (!partitionkeyResponse.ok) {
          console.error(
            `Failed to get partition key for productId: ${item.productId}`
          );
          continue; // Skip this item if we can't get the partition key
        }
        const sellerIdData = await partitionkeyResponse.json();

        const productResponse = await ProductService.getProduct(
          item.productId,
          sellerIdData.sellerId
        );
        if (!productResponse.ok) {
          console.error(
            `Failed to get product details for productId: ${item.productId}`
          );
          continue;
        }
        const productData: Product = await productResponse.json();

        const productWithQuantity = {
          ...productData,
          productQuantity: item.productQuantity,
        };

        orderProducts.push({
          ...productData,
          productQuantity: item.productQuantity,
        });
        totalAmount += (productData.price ?? 0) * item.productQuantity;
        totalQuantity += item.productQuantity;

        if (!sellerId) {
          sellerId = sellerIdData.sellerId;
        } else if (sellerId !== sellerIdData.sellerId) {
          console.warn(
            "Cart contains products from multiple sellers. Creating order for the first seller encountered."
          );
        }
      }

      totalAmount = parseFloat(totalAmount.toFixed(2));

      if (orderProducts.length === 0) {
        throw new Error("No valid products found in cart to create an order.");
      }

      const order: Order = {
        products: orderProducts,
        sellerId: sellerId,
        buyerId: user.email,
        totalAmount: totalAmount,
        orderQuantity: totalQuantity,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const orderResponse = await OrderService.createOrder(order);
      console.log("Order creation response:", orderResponse);

      if (!orderResponse.ok) {
        console.error("Failed to create order:", await orderResponse.text());
        throw new Error("Failed to create order.");
      }

      const orderData = await orderResponse.json();
      const createdOrderId = orderData.id;
      console.log("Created Order ID:", createdOrderId);

      // Create payment with the single order ID
      const payment: Payment = {
        orderId: createdOrderId,
        amount: totalAmount,
        status: "pending",
        paymentMethod: "visa",
        createdAt: new Date().toISOString(),
        firstName: values.firstName,
        lastName: values.lastName,
        billingAddress: values.billingAddress,
        shippingAddress: values.shippingAddress,
        email: values.email,
        cardDetails: {
          cardNumber: values.cardNumber,
          cardHolderName: values.cardName,
          expiryDate: values.expiry,
          cvv: values.cvc,
        },
      };

      const paymentResponse = await PaymentService.createPayment(payment);
      if (!paymentResponse.ok) {
        throw new Error("Payment processing failed");
      }

      CartService.clearCart();
      toast.success("Payment successful! Thank you for your purchase.");
      router.push("/thankyou");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-purple-700" />
            <h1 className="text-3xl font-bold text-gray-900">
              Secure Checkout
            </h1>
            <p className="text-gray-600 mt-2">
              Complete your purchase securely
            </p>
          </div>

          <Card className="shadow-lg border-0 border-t-4 border-purple-700">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-xl">
                <CreditCard className="h-6 w-6 text-purple-700" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handlePayment)}
                  className="space-y-8"
                >
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                      <User className="h-5 w-5 text-purple-700" />
                      Personal Information
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jane"
                                className="h-12 border-gray-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-600" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                className="h-12 border-gray-200"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-600" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="jane.doe@example.com"
                              className="h-12 border-gray-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-8" />

                  {/* Address Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                      <MapPin className="h-5 w-5 text-purple-700" />
                      Address Information
                    </div>

                    <FormField
                      control={form.control}
                      name="billingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Billing Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Billing St, City, State 12345"
                              className="h-12 border-gray-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Shipping Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="456 Shipping Ln, City, State 12345"
                              className="h-12 border-gray-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-8" />

                  {/* Payment Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                      <CreditCard className="h-5 w-5 text-purple-700" />
                      Payment Details
                    </div>

                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Cardholder Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              className="h-12 border-gray-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Card Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="4444 3333 2222 1111"
                              className="h-12 border-gray-200"
                              value={formatCardNumber(field.value)}
                              onChange={(e) => field.onChange(e.target.value)}
                              maxLength={19}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="expiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">
                              Expiry Date
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MM/YY"
                                className="h-12 border-gray-200"
                                value={formatExpiryDate(field.value)}
                                onChange={(e) => field.onChange(e.target.value)}
                                maxLength={5}
                              />
                            </FormControl>
                            <FormMessage className="text-red-600" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">CVC</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                className="h-12 border-gray-200"
                                maxLength={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-600" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Security Notice */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Lock className="h-4 w-4" />
                      Your payment information is secure and encrypted
                    </div>
                    <p className="text-xs text-gray-500">
                      For testing: Use any card details. Cards ending with
                      "0000" will be declined.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-lg text-white font-semibold cursor-pointer transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Complete Payment
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
