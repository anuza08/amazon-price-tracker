"use server";

export async function scrpeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    const scrappedProduct = await scrpeAndStoreProduct(productUrl);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}
