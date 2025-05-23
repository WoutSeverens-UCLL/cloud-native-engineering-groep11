import Header from "@components/header";
import ReviewSection from "@components/reviews/ReviewSection";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import ProductService from "@services/ProductService";
import { ShoppingCart, ArrowLeft, Star, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Product, User } from "types";
import { toast } from "sonner";
import CartService from "@services/CartService";

const ProductDetail = () => {
  const router = useRouter();
  const { id, sellerId } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);

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

        const allProductsResponse = await ProductService.getAllProducts();
        const allProducts = await allProductsResponse.json();
        const related = allProducts
          .filter(
            (p: Product) => p.id !== data.id && p.category === data.category
          )
          .slice(0, 4);
        if (related) {
          setRelatedProducts(related);
        } else {
          toast.error("No related products found");
        }
      } catch (err) {
        setError("Failed to fetch product");
        console.error(err);
        toast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, sellerId]);

  const handleAddItemToCart = async () => {
    try {
      if (!product) {
        toast.error("Product not found");
        router.push("/products");
        return;
      }

      if (!loggedInUser) {
        toast.error("Please log in to add items to your cart.");
        router.push("/login");
        return;
      }

      const userId = loggedInUser?.email ?? "";

      // Probeer de cart op te halen
      const response = await CartService.getCartByUserId(userId);
      let cartData;

      if (response.ok) {
        cartData = await response.json();
      } else {
        // Als er geen cart is, maak er een aan
        const newCartResponse = await CartService.createCart({
          userId,
          items: [],
          updatedAt: new Date(),
        });

        if (!newCartResponse.ok) {
          toast.error("Failed to create a new cart.");
          return;
        }

        cartData = await newCartResponse.json();
      }

      // Voeg het item toe aan de cart
      const item = {
        productId: product.id,
        quantity: quantity, // of een andere logica voor hoeveelheid
        price: product.price,
      };

      const addItemResponse = await CartService.addItemToCart(item, userId);

      if (addItemResponse.ok) {
        toast.success("Product added to cart!");
      } else {
        toast.error("Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Something went wrong while adding item to cart.");
    }
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

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
                    {averageRating !== null ? averageRating.toFixed(1) : 0}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-purple-700">
                € {product.price?.toFixed(2)}
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

            {/* Quantity selector */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Quantity</h2>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-medium text-lg">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <Button
                className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer py-6"
                onClick={handleAddItemToCart}
              >
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
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-gray-300"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={
                        relatedProduct.images?.[0] || "https://placehold.co/400"
                      }
                      alt={relatedProduct.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-1.5">
                      <span className="text-sm text-gray-500">
                        {relatedProduct.category}
                      </span>
                      <div className="flex items-center ml-auto">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold ml-1">
                          {relatedProduct.rating ?? 0}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold line-clamp-2 mb-1.5">
                      {relatedProduct.name}
                    </h3>
                    <div className="font-bold">
                      € {relatedProduct.price?.toFixed(2)}
                    </div>
                    <Button
                      className="w-full mt-3 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                      asChild
                    >
                      <Link
                        href={`/products/${relatedProduct.id}/${relatedProduct.sellerId}`}
                      >
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
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
