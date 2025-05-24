import Header from "@components/header";
import ProductForm from "@components/products/ProductForm";
import ProductService from "@services/ProductService";
import { Loader } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Product, User } from "types";

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const userString = sessionStorage.getItem("loggedInUser");
    if (userString) setLoggedInUser(JSON.parse(userString));
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!router.isReady || !id || authLoading) return;

    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const response = await ProductService.getProduct(
          id as string,
          loggedInUser?.email ?? ""
        );
        const data = await response.json();

        if (!data) {
          toast.error("Product not found");
          router.push("/myproducts");
          return;
        }

        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        toast.error("Failed to load product");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id, router.isReady, authLoading]);

  const handleSubmit = async (productData: Product) => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      await ProductService.updateProduct(id as string, productData);

      toast.success("Product updated successfully!", {
        description: `${productData.name} has been updated.`,
      });
      router.push("/myproducts");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product", {
        description:
          "There was an error updating your product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct || authLoading) {
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
            You need to be logged in to edit a product. Please log in to
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

  if (
    loggedInUser.role !== "seller" ||
    loggedInUser.email !== product?.sellerId
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center border-t-4 border-t-purple-700 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <ProductForm
          initialData={product || undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Save Changes"
          onCancel={() => router.push("/myproducts")}
          title="Edit Product"
        />
      </div>
    </div>
  );
}
