import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Product, User } from "types";
import ProductService from "@services/ProductService";
import { toast } from "sonner";
import Header from "@components/header";
import ProductForm from "@components/products/ProductForm";

export default function CreateProduct() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

  // Form submission
  const handleSubmit = async (productData: Product) => {
    setIsSubmitting(true);
    try {
      const completeProductData = {
        ...productData,
        sellerId: loggedInUser?.email,
      };

      const response = await ProductService.createProduct(completeProductData);
      const createdProduct: Product = await response.json();
      toast.success("Product created successfully!", {
        description: `${productData.name} has been added to your product list.`,
      });

      router.push(`/products/${createdProduct.id}/${createdProduct.sellerId}`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product", {
        description:
          "There was an error creating your product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-red-600 py-12">
            You must be logged in to create a product!
          </div>
        </div>
      </div>
    );
  }

  if (loggedInUser && loggedInUser.role !== "seller") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-red-600 py-12">
            You do not have permission to create a product!
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Create Product"
          onCancel={() => router.push("/myproducts")}
          title="Create New Product"
        />
      </div>
    </div>
  );
}
