"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { scrapeAmazonProduct } from "../scapper";
import { connectToDB } from "../scapper/mongoose";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { User } from "@/types";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    await connectToDB(); // Await the database connection
    const scrappedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrappedProduct) return;

    let product = scrappedProduct;
    const existingProduct = await Product.findOne({ url: scrappedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory = [
        ...existingProduct.priceHistory,
        { price: scrappedProduct.currentPrice },
      ];

      product = {
        ...scrappedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrappedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/Products/${newProduct._id}`);
  } catch (error: any) {
    console.error(`Failed to create/update product: ${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    await connectToDB(); // Await the database connection
    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error: any) {
    console.error(`Failed to get product by ID: ${error.message}`);
  }
}

export async function getAllProducts() {
  try {
    await connectToDB(); // Await the database connection
    const products = await Product.find();
    console.log({ products });
    return products;
  } catch (error: any) {
    console.error(`Failed to get all products: ${error.message}`);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    await connectToDB(); // Await the database connection

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error: any) {
    console.error(`Failed to get similar products: ${error.message}`);
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );

    if (!userExists) {
      product.users.push({ email: userEmail });
      await product.save();
    }

    const emailContent = await generateEmailBody(product, "WELCOME");
    await sendEmail(emailContent, [userEmail]);
  } catch (error: any) {
    console.error(`Failed to add user email to product: ${error.message}`);
  }
}
