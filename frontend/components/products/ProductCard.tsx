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
        <div className="font-bold">€ {product.price?.toFixed(2)}</div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold cursor-pointer"
          onClick={() =>
            router.push(`/products/${product.id}/${product.sellerId}`)
          }
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> View Product
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
