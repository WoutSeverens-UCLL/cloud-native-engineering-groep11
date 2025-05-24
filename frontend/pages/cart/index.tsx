import Header from "@components/header";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import CartService from "@services/CartService";
import ProductService from "@services/ProductService";
import { ArrowLeft, Loader, Minus, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Cart, Product, User } from "types";

const CartPage = () => {
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartProducts, setCartProducts] = useState<
    { itemId: string; quantity: number; product: Product }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const totalAmount = cartProducts.reduce(
    (total, item) => total + (item.product.price ?? 0) * item.quantity,
    0
  );

  const items = cartProducts;

  useEffect(() => {
    const userString = sessionStorage.getItem("loggedInUser");
    if (userString) setLoggedInUser(JSON.parse(userString));
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    const fetchCartAndProducts = async () => {
      if (!loggedInUser?.email) return;

      const response = await CartService.getCartByUserId(loggedInUser.email);
      const cart = await response.json();
      setCart(cart);

      if (!cart?.items?.length) return;

      const detailedItems = await Promise.all(
        cart.items.map(async (item: any) => {
          const sellerIdResponse =
            await ProductService.getPartitionKeyForProduct(item.productId);
          const sellerData = await sellerIdResponse.json();
          const sellerId = sellerData.sellerId;

          const productResponse = await ProductService.getProduct(
            item.productId,
            sellerId
          );
          const product = await productResponse.json();

          return {
            itemId: item.productId,
            quantity: item.quantity,
            product,
          };
        })
      );

      setCartProducts(detailedItems);
    };

    fetchCartAndProducts();
  }, [loggedInUser]);

  const clearCart = async () => {
    if (!loggedInUser?.email) return;

    try {
      setIsLoading(true);
      await CartService.clearItemFromCart(loggedInUser.email);
      toast.success("Cart cleared!");
      setCart(null);
      setCartProducts([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-700" />
          <p className="text-gray-600 text-lg">Loading</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md border-t-4 border-t-purple-700 p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600">
            You need to be logged in to see your cart. Please log in to
            continue.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer px-4 py-2 rounded-md transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loggedInUser && loggedInUser.role !== "buyer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md border-t-4 border-t-purple-700 p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-2">
            You do not have permission to view this page.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer px-4 py-2 rounded-md transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-purple-700 hover:text-purple-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Link>

          <h1 className="text-3xl font-bold mt-4 mb-2">Your Shopping Cart</h1>
          <p className="text-gray-600">{cart?.items?.length} items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-gray-200 border-t-4 border-t-purple-700">
              <CardHeader>
                <CardTitle className="text-3xl">Items</CardTitle>
              </CardHeader>

              <CardContent>
                {!cartProducts.length ? (
                  <div className="py-8 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Your cart is empty</h3>
                    <p className="text-muted-foreground mt-2">
                      Browse our products and add items to your cart.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartProducts.map(({ itemId, quantity, product }) => (
                      <div
                        key={itemId}
                        className="flex items-center justify-between border-b border-gray-200 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {}}
                              disabled={quantity <= 1 || isLoading}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="min-w-[3ch] text-center">
                              {quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {}}
                              disabled={isLoading}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium">
                            € {((product.price ?? 0) * quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="justify-between">
                <Button
                  variant="outline"
                  disabled={cart?.items?.length === 0 || isLoading}
                  onClick={() => clearCart()}
                  className="cursor-pointer border-gray-300 hover:bg-gray-200 font-semibold"
                >
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="shadow-lg border-gray-200 border-t-4 border-t-purple-700">
              <CardHeader>
                <CardTitle className="text-3xl">Order Summary</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-semibold">
                      € {totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping:</span>
                    <span className="font-semibold">Free</span>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="flex justify-between text-lg">
                    <span className="text-2xl font-semibold">Total:</span>
                    <span className="font-bold">
                      € {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                  disabled={items.length === 0 || isLoading}
                  onClick={() => {
                    // Here you can connect to your payment API
                    toast.info(
                      "This is where you would integrate your payment API"
                    );
                  }}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
