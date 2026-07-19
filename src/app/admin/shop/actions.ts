"use server";

import { createServiceClient } from "@/lib/supabase/server";
import {
  extractStoragePath,
  removeStorageFiles,
} from "@/lib/supabase/storage";
import { validateUpload } from "@/lib/validation/upload";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

export async function getShopSettings() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("shop_order_url")
    .eq("id", "singleton")
    .maybeSingle();

  if (error) {
    console.error("Error fetching shop settings:", error);
    return null;
  }
  return data;
}

export async function saveProduct(formData: {
  id?: string;
  name: string;
  description: string;
  price_myr: number;
  sizes: string[];
  sort_order: number;
  active: boolean;
  order_url: string;
}) {
  const supabase = createServiceClient();
  const payload = {
    id: formData.id || undefined,
    name: formData.name,
    description: formData.description || null,
    price_myr: formData.price_myr,
    sizes: formData.sizes.length > 0 ? formData.sizes : null,
    sort_order: formData.sort_order,
    active: formData.active,
    order_url: formData.order_url || null,
  };

  const { error } = await supabase.from("products").upsert(payload);

  if (error) {
    console.error("Error saving product:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/shop");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = createServiceClient();

  const { data: images } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId);

  const { error: imgError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (imgError) {
    console.error("Error deleting product images:", imgError);
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    console.error("Error deleting product:", error);
    return { error: error.message };
  }

  if (images && images.length > 0) {
    const paths = images
      .map((img) => extractStoragePath(img.image_url, "product-images"))
      .filter((p): p is string => p !== null);

    if (paths.length > 0) {
      await removeStorageFiles(supabase, "product-images", paths);
    }
  }

  revalidatePath("/admin/shop");
  revalidatePath("/");
  return { success: true };
}

export async function uploadProductImage(
  productId: string,
  file: File
): Promise<{ error?: string; url?: string }> {
  const validationError = validateUpload(file);
  if (validationError) return validationError;

  const supabase = createServiceClient();
  const fileName = `${productId}-${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(data.path);

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    image_url: urlData.publicUrl,
    sort_order: 0,
  });

  if (insertError) {
    console.error("Error inserting image record:", insertError);
    return { error: insertError.message };
  }

  revalidatePath("/admin/shop");
  return { url: urlData.publicUrl };
}

export async function deleteProductImage(imageId: string) {
  const supabase = createServiceClient();

  const { data: image } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", imageId)
    .maybeSingle();

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    console.error("Error deleting image:", error);
    return { error: error.message };
  }

  if (image?.image_url) {
    const path = extractStoragePath(image.image_url, "product-images");
    if (path) {
      await removeStorageFiles(supabase, "product-images", [path]);
    }
  }

  revalidatePath("/admin/shop");
  return { success: true };
}

export async function reorderProductImages(imageIds: string[]) {
  const supabase = createServiceClient();

  for (let i = 0; i < imageIds.length; i++) {
    const { error } = await supabase
      .from("product_images")
      .update({ sort_order: i })
      .eq("id", imageIds[i]);

    if (error) {
      console.error("Error reordering images:", error);
      return { error: error.message };
    }
  }

  revalidatePath("/admin/shop");
  return { success: true };
}

export async function saveShopSettings(shopOrderUrl: string) {
  const supabase = createServiceClient();

  const { error } = await supabase.from("site_settings").upsert({
    id: "singleton",
    shop_order_url: shopOrderUrl || null,
  });

  if (error) {
    console.error("Error saving shop settings:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/shop");
  return { success: true };
}
