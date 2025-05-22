import { AspectRatio } from "@components/ui/aspect-ratio";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { Product, User } from "types";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/router";
import CartService from "@services/CartService";

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedInUserString = sessionStorage.getItem("loggedInUser");
    if (loggedInUserString !== null) {
      setLoggedInUser(JSON.parse(loggedInUserString));
    }
  }, []);

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
        quantity: 1,
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

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-gray-300">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}/${product.sellerId}`}>
          <AspectRatio ratio={1} className="bg-gray-100">
            <img
              src={
                product.images && product.images.length > 0
                  ? product.images[0]
                  : "https://placehold.co/300x300"
              }
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center mb-1.5">
          <span className="text-sm text-gray-500 text-muted-foreground">
            {product.category}
          </span>
          <div className="flex items-center ml-auto">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold ml-1">{product.rating}</span>
          </div>
        </div>
        <Link href={`/products/${product.id}/${product.sellerId}`}>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1.5">
            {product.name}
          </h3>
        </Link>
        <div className="font-bold">${product.price?.toFixed(2)}</div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
          onClick={handleAddItemToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
