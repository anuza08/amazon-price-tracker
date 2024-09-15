import Product from "@/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scapper";
import { connectToDB } from "@/lib/scapper/mongoose";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/utils";
import { NextResponse } from "next/server"; // Import NextResponse for API responses

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({});

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 404 });
    }

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrappedProduct = await scrapeAmazonProduct(currentProduct.url);
        if (!scrappedProduct) {
          console.error(
            `Failed to scrape product for URL: ${currentProduct.url}`
          );
          return null;
        }

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrappedProduct.currentPrice },
        ];

        const updatedProductData = {
          ...currentProduct.toObject(),
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        // Update the product in the database
        const updatedProduct = await Product.findOneAndUpdate(
          { url: currentProduct.url },
          updatedProductData,
          { upsert: true, new: true }
        );

        const emailNotifType = getEmailNotifType(
          scrappedProduct,
          currentProduct
        );

        if (emailNotifType && updatedProduct.user.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifType
          );
          const userEmails = updatedProduct.user.map((user: any) => user.email);

          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      data: updatedProducts.filter((product) => product !== null),
    });
  } catch (error: any) {
    console.error(`Error in GET: ${error.message}`);
    return NextResponse.json(
      { error: `Failed to update products: ${error.message}` },
      { status: 500 }
    );
  }
}
