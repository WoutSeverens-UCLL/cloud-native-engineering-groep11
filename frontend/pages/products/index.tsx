import Header from "@components/header";
import ProductCard from "@components/products/ProductCard";
import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import ProductService from "@services/ProductService";
import { Loader, Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User, Product } from "types";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userString = sessionStorage.getItem("loggedInUser");
    if (userString) setLoggedInUser(JSON.parse(userString));
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductService.getAllProducts();
        if (!response.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to fetch products");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((c): c is string => typeof c === "string")
    )
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      typeof product.name === "string"
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
        : false;
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Loading</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600">
            You need to be logged in to view all products. Please log in to
            continue.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loggedInUser.role !== "buyer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-2">
            You do not have permission to view this page.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-lg text-gray-600 mt-2">
            Browse our collection of high-quality products
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <CategoryButton
              isSelected={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
              label="All"
            />
            {categories.map((category) => (
              <CategoryButton
                key={category}
                isSelected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                label={category}
              />
            ))}
          </div>
        </div>

        <Separator className="my-6 bg-gray-200" />

        {error ? (
          <StatusMessage message={error} type="error" />
        ) : filteredProducts.length === 0 ? (
          <StatusMessage
            message="No products found matching your criteria"
            type="info"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

type StatusMessageProps = {
  message: string;
  type?: "error" | "info";
};

const StatusMessage = ({ message, type = "error" }: StatusMessageProps) => {
  const textColor = type === "error" ? "text-red-600" : "text-gray-500";
  return (
    <div className="text-center py-12">
      <p className={`text-lg ${textColor}`}>{message}</p>
    </div>
  );
};

type CategoryButtonProps = {
  isSelected: boolean;
  onClick: () => void;
  label: string;
};

const CategoryButton = ({
  isSelected,
  onClick,
  label,
}: CategoryButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
      isSelected
        ? "bg-purple-700 text-white"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default ProductsPage;
