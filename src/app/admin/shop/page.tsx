import { getProducts, getShopSettings } from "./actions";
import { ShopEditorClient } from "./shop-editor-client";

export default async function ShopPage() {
  const [products, shopSettings] = await Promise.all([
    getProducts(),
    getShopSettings(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Shop Editor</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Manage products, images, and pricing.
      </p>
      <div className="mt-6">
        <ShopEditorClient products={products} shopSettings={shopSettings} />
      </div>
    </div>
  );
}
