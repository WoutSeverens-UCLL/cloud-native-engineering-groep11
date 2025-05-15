import Header from "@components/header";
import ReviewSection from "@components/reviews/ReviewSection";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import ProductService from "@services/ProductService";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Product, User } from "types";

const ProductDetail = () => {
  const router = useRouter();
  const { id, sellerId } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  useEffect(() => {
    if (!id || !sellerId) return;

    const fetchProduct = async () => {
      try {
        const response = await ProductService.getProduct(
          id as string,
          sellerId as string
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError("Failed to fetch product");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, sellerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-600">Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The product you are looking for does not exist or has been
              removed.
            </p>
            <Button asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>
        </main>
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img
              src={
                product.images && product.images.length > 0
                  ? product.images[0]
                  : "https://placehold.co/600x400"
              }
              alt={product.name}
              className="w-full h-auto object-contain rounded-md"
              style={{ maxHeight: "400px" }}
            />
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <span className="px-3 py-1 bg-gray-100 text-sm font-semibold rounded-full text-gray-800">
                  {product.category}
                </span>
                <div className="flex items-center ml-auto">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold ml-1">
                    {averageRating !== null
                      ? averageRating.toFixed(1)
                      : 0}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-purple-700">
                ${product.price?.toFixed(2)}
              </p>
            </div>

            <Separator className="my-6" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700">
                {product.description || "No description available."}
              </p>
            </div>

            {Array.isArray(product.features) && product.features.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Features</h2>
                <ul className="list-disc pl-5 text-gray-700">
                  {product.features.map((feature, index) => (
                    <li key={index} className="mb-1">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8">
              <Button className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-lg text-white font-semibold py-6 cursor-pointer">
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
        <ReviewSection
          productId={product.id ?? ""}
          userId={loggedInUser?.email ?? ""}
          onAverageRatingUpdate={setAverageRating}
        />
      </main>
    </div>
  );
};

export default ProductDetail;
