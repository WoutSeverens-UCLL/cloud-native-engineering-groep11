import Header from "@components/header";
import { Button } from "@components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import ProductService from "@services/ProductService";
import { Edit, PlusCircle, Trash, Eye, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Product, User } from "types";

const MyProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const userString = sessionStorage.getItem("loggedInUser");
    if (userString) setLoggedInUser(JSON.parse(userString));
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const fetchMyProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ProductService.getProductsBySellerId(
          loggedInUser?.email ?? ""
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to fetch products");
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [authLoading]);

  const handleDeleteProduct = async (productId: string) => {
    if (!productId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return;

    try {
      const response = await ProductService.deleteProduct(
        productId,
        loggedInUser?.email ?? ""
      );
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product");
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
            You need to be logged in to see your products. Please log in to
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

  if (loggedInUser.role !== "seller") {
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

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Products</h1>

          <Link href="/products/create">
            <Button className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-500 mb-4">
              You haven't added any products yet
            </p>
            <Link href="/products/create">
              <Button className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b-gray-200 hover:bg-gray-100">
                  <TableHead className="w-[100px] text-gray-500 font-semibold">
                    Image
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold">
                    Category
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold">
                    Price
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold">
                    Stock
                  </TableHead>
                  <TableHead className="text-center text-gray-500 font-semibold">
                    View
                  </TableHead>
                  <TableHead className="text-right text-gray-500 font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    className="border-b-gray-200 hover:bg-gray-100"
                    key={product.id}
                  >
                    <TableCell>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                          No img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      {typeof product.price === "number"
                        ? `€ ${product.price.toFixed(2)}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{product.stock ?? "N/A"}</TableCell>
                    <TableCell className="text-center">
                      <Link
                        href={`/products/${product.id}/${product.sellerId}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 cursor-pointer"
                        >
                          <Eye className="h-4 w-4 text-white" />
                        </Button>
                      </Link>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/products/edit/${product.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-500 border-gray-300 hover:border-gray-600 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 text-black" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-gray-300 hover:border-red-600 cursor-pointer"
                          onClick={() =>
                            product.id && handleDeleteProduct(product.id)
                          }
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow flex items-center justify-center">
        <p className={`text-lg ${textColor} text-center`}>{message}</p>
      </main>
    </div>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <main className="container mx-auto py-8 px-4 flex-grow">{children}</main>
  </div>
);

export default MyProducts;
