import Header from "@components/header";
import ReviewSection from "@components/reviews/ReviewSection";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardFooter } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import ProductService from "@services/ProductService";
import CartService from "@services/CartService";
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Plus,
  Minus,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Product, User } from "types";

const ProductDetail = () => {
  const router = useRouter();
  const { id, sellerId } = router.query;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Load user from session
  useEffect(() => {
    const userString = sessionStorage.getItem("loggedInUser");
    if (userString) {
      try {
        setLoggedInUser(JSON.parse(userString));
      } catch (err) {
        console.error("Error parsing user", err);
        toast.error("Failed to parse user session");
      }
    }
    setLoadingUser(false);
  }, []);

  // Load product and related products
  useEffect(() => {
    if (!router.isReady || !id || !sellerId || loadingUser) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await ProductService.getProduct(
          id as string,
          sellerId as string
        );
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);

        const allRes = await ProductService.getAllProducts();
        const allProducts = await allRes.json();
        const related = allProducts
          .filter(
            (p: Product) => p.id !== data.id && p.category === data.category
          )
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Error loading product", err);
        setError("Failed to load product");
        toast.error("Product details could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, id, sellerId, loadingUser]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (!product) return;
    if (!loggedInUser) {
      toast.error("Please log in to add items to your cart.");
      return router.push("/login");
    }

    try {
      const userId = loggedInUser.email ?? "";
      const cartRes = await CartService.getCartByUserId(userId);
      let cart = cartRes.ok ? await cartRes.json() : null;

      if (!cart) {
        const newCartRes = await CartService.createCart({
          userId,
          items: [],
          updatedAt: new Date(),
        });
        if (!newCartRes.ok) throw new Error("Failed to create cart");
        cart = await newCartRes.json();
      }

      const item = {
        productId: product.id,
        quantity,
        price: product.price,
      };

      const addRes = await CartService.addItemToCart(item, userId);
      if (!addRes.ok) throw new Error("Failed to add item");

      toast.success("Product added to cart!");
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error("Could not add product to cart.");
    }
  };

  // Conditional Rendering
  if (loadingUser || isLoading) {
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
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 border-t-4 border-t-purple-700 text-center">
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
            You need to be logged in to see the details of a product. Please log
            in to continue.
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

  if (!["buyer", "seller", "admin"].includes(loggedInUser.role ?? "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 border-t-4 border-t-purple-700 text-center">
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 text-lg">No products found</p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer px-4 py-2 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={loggedInUser.role === "seller" ? "/myproducts" : "/products"}
            className="inline-flex items-center text-purple-700 hover:text-purple-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img
              src={product.images?.[0] ?? "https://placehold.co/600x400"}
              alt={product.name}
              className="w-full h-auto object-contain rounded-md"
              style={{ maxHeight: "400px" }}
            />
          </div>

          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 bg-gray-100 text-sm font-semibold rounded-full text-gray-800">
                  {product.category}
                </span>
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">
                    {averageRating?.toFixed(1) ?? "0.0"}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-2xl text-purple-700 font-bold mt-2">
                € {product.price != null ? product.price.toFixed(2) : "N/A"}
              </p>
            </div>

            <Separator className="my-6" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">
                {product.description || "No description available."}
              </p>
            </div>

            {Array.isArray(product.features) && product.features.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Features</h2>
                <ul className="list-disc pl-5 text-gray-700">
                  {product.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Controls */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Quantity</h2>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 text-lg font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection
          productId={product.id ?? ""}
          userId={loggedInUser.email ?? ""}
          onAverageRatingUpdate={setAverageRating}
        />

        {/* Related Products */}
        {loggedInUser.role === "buyer" && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Card
                  key={p.id}
                  className="overflow-hidden hover:shadow-lg border border-gray-200 transition"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={p.images?.[0] ?? "https://placehold.co/300x300"}
                      alt={p.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{p.category}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1">{p.rating ?? 0}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold line-clamp-2 mt-2">
                      {p.name}
                    </h3>
                    <div className="font-bold mt-1">
                      € {p.price?.toFixed(2)}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                      asChild
                    >
                      <Link href={`/products/${p.id}/${p.sellerId}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;
