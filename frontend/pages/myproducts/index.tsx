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
import { Edit, PlusCircle, Trash } from "lucide-react";
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
      toast.error("You must be logged in to view your products");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!loggedInUser) return;

      try {
        setLoading(true);
        const response = await ProductService.getProductsBySellerId(
          loggedInUser.email ?? ""
        );

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
  }, [loggedInUser]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">Loading your products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Products</h1>

          {products.length > 0 && (
            <Link href="/products/create">
              <Button className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
          )}
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

export default MyProducts;
