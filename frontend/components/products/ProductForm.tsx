import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Product } from "types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  brand: z.string().min(1, "Brand is required"),
  category: z.nativeEnum(Category, {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  stock: z.coerce
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer"),
});

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Product) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  onCancel: () => void;
  title: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
  title,
}: Readonly<ProductFormProps>) {
  // State for array inputs
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [colors, setColors] = useState<string[]>(initialData?.colors || []);
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);
  const [features, setFeatures] = useState<string[]>(
    initialData?.features || []
  );
  const [newImage, setNewImage] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newFeature, setNewFeature] = useState("");

  // Form setup
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      price: initialData?.price ?? 0,
      brand: initialData?.brand ?? "",
      category: (initialData?.category as Category) ?? "",
      stock: initialData?.stock ?? 0,
    },
  });

  // Add handlers for array inputs
  const addImage = () => {
    if (newImage && !images.includes(newImage)) {
      setImages([...images, newImage]);
      setNewImage("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor("");
    }
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize("");
    }
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature && !features.includes(newFeature)) {
      setFeatures([...features, newFeature]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const getCategoryLabel = (key: Category) => {
    const labels: Record<Category, string> = {
      [Category.ELECTRONICS]: "Electronics",
      [Category.CLOTHING]: "Clothing",
      [Category.HOME]: "Home & Living",
      [Category.BOOKS]: "Books",
      [Category.TOYS]: "Toys",
      [Category.SPORTS]: "Sports",
      [Category.HEALTH]: "Health",
      [Category.BEAUTY]: "Beauty",
      [Category.AUTOMOTIVE]: "Automotive",
      [Category.GROCERY]: "Grocery",
    };
    return labels[key];
  };

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      // Combine form values with array inputs
      const productData: Product = {
        ...initialData,
        ...values,
        images,
        colors,
        sizes,
        features,
      };

      // Call the provided submit handler
      await onSubmit(productData);
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Failed to submit product", {
        description:
          "There was an error processing your request. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-gray-200 border-t-4 border-t-purple-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Product Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-gray-200"
                        placeholder="Product name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Brand</FormLabel>
                    <FormControl>
                      <Input
                        className="border-gray-200"
                        placeholder="Brand name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Price (€)</FormLabel>
                    <FormControl>
                      <Input
                        className="border-gray-200"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Stock</FormLabel>
                    <FormControl>
                      <Input
                        className="border-gray-200"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Category</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="border-gray-200 rounded-md w-full px-3 py-2 text-sm text-gray-700"
                      >
                        <option value="">-- Select category --</option>
                        {Object.values(Category).map((option) => (
                          <option key={option} value={option}>
                            {getCategoryLabel(option)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description"
                      className="min-h-[120px] border-gray-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm" />
                </FormItem>
              )}
            />

            {/* Image URLs */}
            <div className="space-y-2">
              <FormLabel className="font-semibold">Images</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  className="border-gray-200"
                  placeholder="Image URL"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                />
                <Button
                  className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                  type="button"
                  onClick={addImage}
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 text-secondary-foreground px-3 py-1 rounded-md"
                    >
                      <span className="truncate max-w-[200px]">{image}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-1 cursor-pointer"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <FormLabel className="font-semibold">Colors</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  className="border-gray-200"
                  placeholder="Color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                />
                <Button
                  className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                  type="button"
                  onClick={addColor}
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 text-secondary-foreground px-3 py-1 rounded-md"
                    >
                      <span>{color}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-1 cursor-pointer"
                        onClick={() => removeColor(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <FormLabel className="font-semibold">Sizes</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  className="border-gray-200"
                  placeholder="Size"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                />
                <Button
                  className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                  type="button"
                  onClick={addSize}
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 text-secondary-foreground px-3 py-1 rounded-md"
                    >
                      <span>{size}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-1 cursor-pointer"
                        onClick={() => removeSize(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <FormLabel className="font-semibold">Features</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  className="border-gray-200"
                  placeholder="Feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                />
                <Button
                  className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                  type="button"
                  onClick={addFeature}
                  size="sm"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 text-secondary-foreground px-3 py-1 rounded-md"
                    >
                      <span className="truncate max-w-[200px]">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-1 cursor-pointer"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                className="cursor-pointer border-gray-300 hover:bg-gray-200"
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : submitButtonText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
