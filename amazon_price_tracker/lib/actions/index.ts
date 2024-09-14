"use server";
import { scrapeAmazonProduct } from "../scapper";

export async function scrpeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    connectToBD();

    const scrappedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrappedProduct) return;

    return scrappedProduct;
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}
