import {
  SHOP_HEADLINE,
  SHOP_SUBTITLE,
  SHOP_CTA_TEXT,
} from "@/lib/constants/copy";
import { buildProductOrderLink } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, type Product } from "./ShopCard";

interface ShopSettings {
  shop_order_url: string | null;
}

async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price_myr, sizes, order_url, sort_order, product_images(image_url, sort_order)")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[ShopSection] Supabase error:", error.message, error.code, error.details);
  }
  console.log("[ShopSection] products fetched:", data?.length ?? 0, data);
  return data ?? [];
}

async function getShopSettings(): Promise<ShopSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("shop_order_url")
    .eq("id", "singleton")
    .single();
  return data;
}

export async function ShopSection() {
  const [products, settings] = await Promise.all([
    getProducts(),
    getShopSettings(),
  ]);

  const globalOrderUrl = settings?.shop_order_url ?? "#";

  return (
    <section
      id="shop"
      aria-labelledby="shop-headline"
      className="py-16 md:py-24 bg-foreground"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="shop-headline"
          className="text-3xl md:text-4xl text-background font-semibold text-center mb-4"
        >
          {SHOP_HEADLINE}
        </h2>
        <p className="text-primary text-center mb-10">
          {SHOP_SUBTITLE}
        </p>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {products.map((product) => {
              const orderUrl =
                buildProductOrderLink(product.order_url, globalOrderUrl) ?? "#";
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  orderUrl={orderUrl}
                  ctaText={SHOP_CTA_TEXT}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-primary text-center">Shop items coming soon.</p>
        )}
      </div>
    </section>
  );
}
