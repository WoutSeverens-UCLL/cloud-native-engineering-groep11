import Header from "@components/header";
import ProductCard from "@components/products/ProductCard";
import { Input } from "@components/ui/input";
import { Separator } from "@components/ui/separator";
import ProductService from "@services/ProductService";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "types";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await ProductService.getAllProducts();
        const data = await response.json();
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
    new Set(products.map((product: any) => product.category))
  );

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

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
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground text-gray-500" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === null
                  ? "bg-purple-700 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? "bg-purple-700 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <Separator className="my-6 bg-gray-200" />

        {(() => {
          if (!loggedInUser) {
            return (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg">
                  You must be logged in to view all products!
                </p>
              </div>
            );
          }
          if (loggedInUser && loggedInUser.role !== "buyer") {
            return (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg">
                  You do not have permission to view all products!
                </p>
              </div>
            );
          }
          if (isLoading) {
            return (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            );
          } else if (error) {
            return (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            );
          } else if (filteredProducts.length === 0) {
            return (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria
                </p>
              </div>
            );
          } else {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            );
          }
        })()}
      </main>
    </div>
  );
};

export default ProductsPage;
