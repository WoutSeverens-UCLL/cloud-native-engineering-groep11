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
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
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
  const totalAmount = cartProducts.reduce(
    (total, item) => total + (item.product.price ?? 0) * item.quantity,
    0
  );

  const items = cartProducts;

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");

    try {
      if (loggedInUserString) {
        const parsed = JSON.parse(loggedInUserString);
        if (parsed && typeof parsed === "object") {
          setLoggedInUser(parsed);
          return;
        }
      }
      throw new Error("Invalid or missing user");
    } catch (e) {
      console.error("Failed to parse logged in user:", e);
      toast.error("You must be logged in to view your cart");
      router.push("/login");
    }
  }, [router]);

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
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>

              <CardContent>
                {cart?.items?.length === 0 ? (
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
                        className="flex items-center justify-between border-b py-4"
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
                            ${((product.price ?? 0) * quantity).toFixed(2)}
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
                >
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-medium">Free</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900"
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
