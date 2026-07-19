"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

interface ProductImage {
  image_url: string;
}

export interface Product {
  id: string;
  name: string;
  price_myr: number;
  sizes: string[] | null;
  order_url: string | null;
  product_images: ProductImage[];
}

export function ProductCard({
  product,
  orderUrl,
  ctaText,
}: {
  product: Product;
  orderUrl: string;
  ctaText: string;
}) {
  const prefersReduced = usePrefersReducedMotion();
  const images = product.product_images ?? [];

  return (
    <div
      className="rounded-[10px] overflow-hidden border border-background/10"
    >
      <div className="aspect-square bg-background/10 overflow-hidden">
        {images.length > 0 ? (
          <Carousel
            plugins={
              prefersReduced
                ? []
                : [Autoplay({ delay: 3000, stopOnInteraction: false })]
            }
            opts={{ loop: true }}
          >
            <CarouselContent>
              {images.map((img, i) => (
                <CarouselItem key={i}>
                  <img
                    src={img.image_url}
                    alt={`${product.name} - image ${i + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-background/50 text-sm">No images</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2 bg-foreground border-t border-background/10">
        <h3 className="text-background font-semibold">{product.name}</h3>
        <p className="text-primary text-base font-bold">
          RM {product.price_myr}
        </p>
        {product.sizes && product.sizes.length > 0 && (
          <p className="text-background/70 text-xs">
            {product.sizes.join(", ")}
          </p>
        )}
        <a
          href={orderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block w-full text-center rounded-[7px] px-3 py-3 min-h-[44px] bg-background text-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
