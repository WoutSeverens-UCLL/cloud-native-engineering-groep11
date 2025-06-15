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
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { GetStaticProps, GetStaticPaths } from "next";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Add getStaticPaths to handle static generation
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // Don't pre-generate any pages at build time
    fallback: "blocking", // Show a loading state while generating new pages
  };
};

// Add getStaticProps to handle static generation
export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const { id, sellerId } = params as { id: string; sellerId: string };

    // Fetch product data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/id/${id}/seller/${sellerId}${process.env.FK_PRODUCTS_GET_BY_ID_SELLER_ID}`
    );

    if (!res.ok) {
      return {
        notFound: true,
      };
    }

    const product = await res.json();

    // Fetch related products
    const allRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products${process.env.FK_PRODUCTS}`
    );
    const allProducts = await allRes.json();
    const relatedProducts = allProducts
      .filter(
        (p: Product) => p.id !== product.id && p.category === product.category
      )
      .slice(0, 4);

    return {
      props: {
        product,
        relatedProducts,
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      notFound: true,
    };
  }
};

const ProductDetail = ({
  product: initialProduct,
  relatedProducts: initialRelatedProducts,
}: {
  product?: Product;
  relatedProducts?: Product[];
}) => {
  const router = useRouter();
  const { id, sellerId } = router.query;

  const [product, setProduct] = useState<Product | null>(
    initialProduct || null
  );
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(
    initialRelatedProducts || []
  );
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

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

  // Modify the useEffect to only fetch if we don't have initial data
  useEffect(() => {
    if (!router.isReady || !id || !sellerId || loadingUser) return;
    if (initialProduct) return; // Skip fetching if we have initial data

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

        // Set default selections
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0].toLowerCase());
        }
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }

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
  }, [router.isReady, id, sellerId, loadingUser, initialProduct]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!loggedInUser) {
      toast.error("Please log in to add items to your cart.");
      return router.push("/login");
    }

    // Validatie voor verplichte selecties
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color.");
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }

    try {
      const item = {
        productId: product.id,
        productQuantity: quantity,
        price: product.price,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      };

      CartService.addItemToCart(item);
      toast.success(
        `Product added to cart! ${
          selectedColor ? `Color: ${selectedColor}` : ""
        } ${selectedSize ? `Size: ${selectedSize}` : ""}`
      );
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error("Could not add product to cart.");
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 99)) {
      setQuantity(newQuantity);
    }
  };

  function getContrastColor(color: string): string {
    // Standaardkleuren en hun RGB waardes (donkere kleuren)
    const darkColors = new Set([
      "black",
      "navy",
      "purple",
      "brown",
      "maroon",
      "darkred",
      "darkgreen",
      "darkblue",
      "darkslategray",
      "darkslategrey",
      "indigo",
      "midnightblue",
      "teal",
      "forestgreen",
      "darkmagenta",
      "darkviolet",
      "slateblue",
      "rebeccapurple",
      "firebrick",
    ]);

    // Kleine helper om hex naar rgb te converteren
    function hexToRgb(hex: string) {
      hex = hex.replace(/^#/, "");
      if (hex.length === 3) {
        hex = hex
          .split("")
          .map((c) => c + c)
          .join("");
      }
      const num = parseInt(hex, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    }

    // Luminantie berekenen volgens WCAG
    function luminance(r: number, g: number, b: number) {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }

    const lower = color.toLowerCase().trim();

    // Eerst checken op namen
    if (darkColors.has(lower)) {
      return "white";
    }

    // Check of het hex is (bijv. #123456)
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(lower)) {
      const { r, g, b } = hexToRgb(lower);
      // wit tekst bij donkere kleuren (luminantie laag)
      return luminance(r, g, b) < 0.5 ? "white" : "black";
    }

    // Fallback, assume lichte kleur, zwart als tekst
    return "black";
  }

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
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              spaceBetween={20}
              slidesPerView={1}
              loop={product.images && product.images.length > 1}
              className="product-image-swiper"
              style={
                {
                  "--swiper-navigation-color": "#7c3aed",
                  "--swiper-pagination-color": "#7c3aed",
                } as any
              }
            >
              {(product.images ?? ["https://placehold.co/600x400"]).map(
                (img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="w-full flex justify-center items-center bg-gray-50 rounded-md overflow-hidden">
                      <img
                        src={img}
                        alt={`Product Image ${idx + 1}`}
                        className="w-full h-auto object-cover"
                        style={{
                          maxHeight: "400px",
                          minHeight: "300px",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/600x400?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  </SwiperSlide>
                )
              )}
            </Swiper>
          </div>

          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                {/* Category en Brand samen in één flex container met spacing */}
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-gray-100 text-sm font-semibold rounded-full text-gray-800">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="px-3 py-1 bg-gray-100 text-sm font-semibold rounded-full text-gray-600">
                      {product.brand}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {averageRating?.toFixed(1) ?? "0.0"}
                  </span>
                </div>
              </div>

              {/* Product naam */}
              <h1 className="text-3xl font-bold leading-tight">
                {product.name}
              </h1>

              {/* Prijs */}
              <p className="text-2xl text-purple-700 font-bold mt-3">
                € {product.price != null ? product.price.toFixed(2) : "N/A"}
              </p>

              {/* Colors */}
              {Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Colors:</h3>
                  <div className="flex space-x-2">
                    {product.colors.map((color, i) => {
                      const isSelected = selectedColor === color.toLowerCase();
                      return (
                        <button
                          key={i}
                          className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${
                            isSelected
                              ? "border-4 border-purple-700 shadow-lg"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                          onClick={() => setSelectedColor(color.toLowerCase())}
                        >
                          {isSelected && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: getContrastColor(color),
                                }}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedColor && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected:{" "}
                      <span className="font-medium capitalize">
                        {selectedColor}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Sizes */}
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Sizes:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, i) => (
                      <button
                        key={i}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all hover:scale-105 cursor-pointer ${
                          selectedSize === size
                            ? "border-purple-700 bg-purple-700 text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected:{" "}
                      <span className="font-medium">{selectedSize}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Quantity:</h3>
                <div className="flex items-center space-x-3">
                  <button
                    className="w-10 h-10 cursor-pointer rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-purple-700 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-semibold min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 cursor-pointer rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-purple-700 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product?.stock || 99)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stock */}
              <div className="mt-4">
                <h3 className="font-semibold mb-1">Stock:</h3>
                <p
                  className={`font-medium ${
                    typeof product.stock === "number" && product.stock > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {typeof product.stock === "number" && product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </p>
              </div>
            </div>

            <Separator className="my-6 bg-gray-200" />

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description || ""}
              </p>
            </div>

            {/* Features */}
            {Array.isArray(product.features) && product.features.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Features</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {product.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Cart button */}
            <Button
              className={`w-full bg-gradient-to-r from-purple-700 to-indigo-800 cursor-pointer ${
                loggedInUser.role === "seller" ||
                (typeof product.stock === "number" && product.stock <= 0)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-purple-800 hover:to-indigo-900"
              } text-white font-semibold py-3 flex items-center justify-center`}
              onClick={() => {
                if (
                  loggedInUser.role !== "seller" &&
                  (typeof product.stock !== "number" || product.stock > 0)
                ) {
                  handleAddToCart();
                }
              }}
              disabled={
                loggedInUser.role === "seller" ||
                (typeof product.stock === "number" && product.stock <= 0)
              }
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {typeof product.stock === "number" && product.stock <= 0
                ? "Out of Stock"
                : "Add to Cart"}
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
