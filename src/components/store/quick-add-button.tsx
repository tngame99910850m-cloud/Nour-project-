"use client";

import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-context";
import { track } from "@/lib/track-client";

interface Props {
  product: {
    productId: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    stock: number;
  };
}

export function QuickAddButton({ product }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  const handle = () => {
    if (soldOut) return;
    addItem(product, 1);
    setAdded(true);
    track("add_to_cart", { productId: product.productId });
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handle}
      disabled={soldOut}
      className="btn-outline btn-sm w-full"
    >
      {soldOut ? (
        "Sold Out"
      ) : added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </>
      )}
    </button>
  );
}
