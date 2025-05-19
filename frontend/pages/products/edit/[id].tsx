import Header from "@components/header";
import ProductForm from "@components/products/ProductForm";
import ProductService from "@services/ProductService";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Product, User } from "types";

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  useEffect(() => {
    if (!id || !loggedInUser) return;

    const fetchProduct = async () => {
      setIsLoading(true);
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
        router.push("/myproducts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, loggedInUser]);

  // Form submission handler
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">Loading product details...</div>
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
