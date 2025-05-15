import { AspectRatio } from "@components/ui/aspect-ratio";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { Product } from "types";

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-0">
        <AspectRatio ratio={1 / 1} className="bg-gray-100">
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
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center mb-1.5">
          <span className="text-sm text-muted-foreground">
            {product.category}
          </span>
          <div className="flex items-center ml-auto">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium ml-1">{product.rating}</span>
          </div>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 mb-1.5">
          {product.name}
        </h3>
        <div className="font-bold">${product.price?.toFixed(2)}</div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
