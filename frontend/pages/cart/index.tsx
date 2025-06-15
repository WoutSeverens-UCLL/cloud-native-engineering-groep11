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
import {
  ArrowLeft,
  Loader,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CartItem, Product, User } from "types";

const CartPage = () => {
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [cartProducts, setCartProducts] = useState<
    {
      itemId: string;
      quantity: number;
      product: Product;
      color: string;
      size: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());

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
    const fetchCartProducts = async () => {
      const localItems = CartService.getCart();
      console.log("Cart items:", localItems);
      const detailedItems = await Promise.all(
        localItems.map(async (item: CartItem) => {
          const sellerIdResponse =
            await ProductService.getPartitionKeyForProduct(
              item.productId || ""
            );
          const sellerData = await sellerIdResponse.json();
          const sellerId = sellerData.sellerId;

          const productResponse = await ProductService.getProduct(
            item.productId || "",
            sellerId
          );
          const product = await productResponse.json();

          return {
            itemId: item.productId ?? "",
            quantity: item.productQuantity ?? 0,
            product,
            color: item.color ?? "",
            size: item.size ?? "",
          };
        })
      );

      setCartProducts(detailedItems);
    };

    fetchCartProducts();
  }, []);

  const removeItemFromCart = async (productId: string) => {
    try {
      setDeletingItems((prev) => new Set(prev).add(productId));
      CartService.removeItemFromCart(productId);
      setCartProducts((prev) =>
        prev.filter((item) => item.itemId !== productId)
      );
      toast.success("Item removed from cart!");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item. Please try again.");
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      CartService.clearCart();
      toast.success("Cart cleared!");
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
          <p className="text-gray-600">{cartProducts.length} items</p>
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
                    <Button
                      asChild
                      className="mt-4 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                    >
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartProducts.map(
                      ({ itemId, quantity, product, color, size }) => (
                        <div
                          key={itemId}
                          className="flex items-start gap-4 border-b border-gray-200 pb-6 last:border-b-0"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={
                                product.images?.[0] ||
                                "https://placehold.co/100x100"
                              }
                              alt={product.name || "Product"}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/100x100?text=No+Image";
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                  {product.name}
                                </h3>

                                {/* Product variants */}
                                <div className="mt-2 space-y-1">
                                  {color && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-500">
                                        Color:
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="w-4 h-4 rounded-full border border-gray-300"
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                        <span className="text-sm font-medium capitalize">
                                          {color}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {size && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-500">
                                        Size:
                                      </span>
                                      <span className="text-sm font-medium">
                                        {size}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                      Quantity:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {quantity}x
                                    </span>
                                  </div>
                                </div>

                                {/* Category and Brand */}
                                <div className="mt-2 flex gap-2">
                                  {product.category && (
                                    <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                                      {product.category}
                                    </span>
                                  )}
                                  {product.brand && (
                                    <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                                      {product.brand}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Price and Actions Section */}
                              <div className="text-right ml-4 flex flex-col items-end gap-2">
                                <div>
                                  <div className="text-lg font-bold text-gray-900">
                                    €{" "}
                                    {((product.price ?? 0) * quantity).toFixed(
                                      2
                                    )}
                                  </div>
                                  {quantity > 1 && (
                                    <div className="text-sm text-gray-500">
                                      € {(product.price ?? 0).toFixed(2)} each
                                    </div>
                                  )}
                                </div>

                                {/* Delete Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItemFromCart(itemId)}
                                  disabled={deletingItems.has(itemId)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 cursor-pointer"
                                >
                                  {deletingItems.has(itemId) ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) 
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="justify-between">
                <Button
                  variant="outline"
                  disabled={cartProducts.length === 0 || isLoading}
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
                  onClick={() => router.push("/checkout")}
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
