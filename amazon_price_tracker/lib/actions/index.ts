"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { scrapeAmazonProduct } from "../scapper";
import { connectToDB } from "../scapper/mongoose";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { User } from "@/types";

export async function scrpeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    connectToDB();

    const scrappedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrappedProduct) return;
    let product = scrappedProduct;

    const exsitingProduct = await Product.findOne({ url: scrappedProduct.url });
    if (exsitingProduct) {
      const updatedPriceHistory: any = [
        ...exsitingProduct.priceHistory,
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
      {
        url: scrappedProduct.url,
      },
      product,
      {
        upsert: true,
        new: true,
      }
    );

    revalidatePath(`/Products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

export async function getProductById(productId: String) {
  try {
    connectToDB();
    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error) {}
}

export async function getAllProduct() {
  try {
    connectToDB();

    const product = await Product.find();
    console.log({ product });
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProduct(productId: String) {
  try {
    connectToDB();

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: String, userEmail: any) {
  try {
    //send our first email..

    const product = await Product.findById(productId);

    if (!product) return;

    const userExists = product.users.some(
      (user: User) => userEmail.email === userEmail
    );

    if (!userExists) {
      product.users.push({ email: userEmail });
      await product.save();
    }
    const emailContent = generateEmailBody(product, "WELCOME");
    await sendEmail(await emailContent, [userEmail]);
  } catch (error) {
    console.log(error);
  }
}


