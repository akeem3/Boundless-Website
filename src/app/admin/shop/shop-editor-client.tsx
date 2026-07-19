"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  saveProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
  saveShopSettings,
} from "./actions";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  UploadIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Loader2Icon,
  SettingsIcon,
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price_myr: z.string().min(1, "Price is required"),
  sizes: z.string().optional(),
  sort_order: z.string().optional(),
  active: z.boolean(),
  order_url: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductImage {
  id: string;
  image_url: string;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_myr: number;
  sizes: string[] | null;
  sort_order: number;
  active: boolean;
  order_url: string | null;
  product_images: ProductImage[];
}

interface ShopEditorClientProps {
  products: Product[];
  shopSettings: { shop_order_url: string | null } | null;
}

export function ShopEditorClient({ products, shopSettings }: ShopEditorClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [globalOrderUrl, setGlobalOrderUrl] = useState(
    shopSettings?.shop_order_url ?? ""
  );
  const [savingSettings, setSavingSettings] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price_myr: "0",
      sizes: "",
      sort_order: "0",
      active: true,
      order_url: "",
    },
  });

  function openCreateDialog() {
    setEditingProduct(null);
    reset({
      name: "",
      description: "",
      price_myr: "0",
      sizes: "",
      sort_order: String(products.length),
      active: true,
      order_url: "",
    });
    setDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description ?? "",
      price_myr: String(product.price_myr),
      sizes: product.sizes?.join(", ") ?? "",
      sort_order: String(product.sort_order),
      active: product.active,
      order_url: product.order_url ?? "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: ProductFormData) {
    setSaving(true);
    const sizes = data.sizes
      ? data.sizes.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const result = await saveProduct({
      id: editingProduct?.id,
      name: data.name,
      description: data.description ?? "",
      price_myr: Number(data.price_myr),
      sizes,
      sort_order: Number(data.sort_order) || 0,
      active: data.active,
      order_url: data.order_url ?? "",
    });
    setSaving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(editingProduct ? "Product updated." : "Product created.");
      setDialogOpen(false);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    const result = await deleteProduct(id);
    setDeleting(null);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Product deleted.");
      router.refresh();
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, productId: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setUploadingImage(true);
    const result = await uploadProductImage(productId, file);
    setUploadingImage(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Image uploaded.");
    }
  }

  async function handleDeleteImage(imageId: string) {
    const result = await deleteProductImage(imageId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Image removed.");
    }
  }

  async function handleMoveImage(
    product: Product,
    imageIndex: number,
    direction: "up" | "down"
  ) {
    const images = [...product.product_images].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    const newIndex = direction === "up" ? imageIndex - 1 : imageIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    [images[imageIndex], images[newIndex]] = [images[newIndex], images[imageIndex]];
    const ids = images.map((img) => img.id);
    await reorderProductImages(ids);
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    const result = await saveShopSettings(globalOrderUrl);
    setSavingSettings(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Shop settings saved.");
      setSettingsOpen(false);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
          <SettingsIcon className="size-4" />
          Settings
        </Button>
        <Button size="sm" onClick={openCreateDialog}>
          <PlusIcon className="size-4" />
          New product
        </Button>
      </div>

      <div className="space-y-3">
        {products.length === 0 && (
          <p className="text-sm text-foreground/60 text-center py-8">
            No products yet. Create one to get started.
          </p>
        )}
        {products.map((product) => {
          const sortedImages = [...product.product_images].sort(
            (a, b) => a.sort_order - b.sort_order
          );
          return (
            <div
              key={product.id}
              className="rounded-xl border border-border-subtle bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    {!product.active && (
                      <span className="text-xs text-foreground/40">(inactive)</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    RM {product.price_myr.toFixed(2)}
                    {product.sizes && product.sizes.length > 0 && (
                      <> — Sizes: {product.sizes.join(", ")}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditDialog(product)}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={deleting === product.id}
                    onClick={() => handleDelete(product.id)}
                  >
                    {deleting === product.id ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <Trash2Icon className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {sortedImages.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {sortedImages.map((img, idx) => (
                    <div key={img.id} className="relative size-20 shrink-0">
                      <img
                        src={img.image_url}
                        alt=""
                        className="size-full rounded-lg object-cover border border-border-subtle"
                      />
                      <div className="absolute -top-1 -right-1 flex gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(product, idx, "up")}
                          className="rounded bg-background/80 p-0.5 text-foreground/60 hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowUpIcon className="size-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sortedImages.length - 1}
                          onClick={() => handleMoveImage(product, idx, "down")}
                          className="rounded bg-background/80 p-0.5 text-foreground/60 hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowDownIcon className="size-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute -top-1 -left-1 rounded bg-background/80 p-0.5 text-destructive hover:text-destructive"
                      >
                        <Trash2Icon className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`upload-${product.id}`}
                  onChange={(e) => handleImageUpload(e, product.id)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() =>
                    document.getElementById(`upload-${product.id}`)?.click()
                  }
                >
                  <UploadIcon className="size-3" />
                  Add image
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit product" : "New product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Name</Label>
              <Input id="product-name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea id="product-description" rows={3} {...register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-price">Price (MYR)</Label>
                <Input id="product-price" type="number" step="0.01" {...register("price_myr")} />
                {errors.price_myr && (
                  <p className="text-xs text-destructive">{errors.price_myr.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sort">Sort order</Label>
                <Input id="product-sort" type="number" {...register("sort_order")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sizes">Sizes (comma-separated)</Label>
              <Input
                id="product-sizes"
                placeholder="S, M, L, XL"
                {...register("sizes")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-order-url">Custom order URL (optional)</Label>
              <Input
                id="product-order-url"
                placeholder="https://..."
                {...register("order_url")}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="product-active"
                className="size-4 rounded border-border-subtle accent-foreground"
                checked={watch("active")}
                onChange={(e) => setValue("active", e.target.checked)}
              />
              <Label htmlFor="product-active" className="cursor-pointer">
                Active (visible on site)
              </Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : editingProduct ? (
                  "Save changes"
                ) : (
                  "Create product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shop Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="global-order-url">
                Default order URL (fallback for all products)
              </Label>
              <Input
                id="global-order-url"
                placeholder="https://..."
                value={globalOrderUrl}
                onChange={(e) => setGlobalOrderUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={savingSettings} onClick={handleSaveSettings}>
              {savingSettings ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save settings"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
