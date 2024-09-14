import axios from "axios";
import * as cheerio from "cheerio";
import { log } from "console";
import { extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  // echo -e "\n\nThis is the VERBOSE version sample cURL code for Web Unlocker.\nIn order to instantly use Web Unlocker, you need to either install an SSL certificate\nor to ignore SSL errors in your code.\n\nThis cURL includes the '-k' option to ignore SSL errors.\n\nPress Enter to continue..." && read input && echo -e "\nThanks. I am going to run the following cURL command now:\n" && echo "curl -i --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_1acb0075-zone-web_unlocker1:zl4a7r45evns -k \"https://geo.brdtest.com/welcome.txt\"" && echo -e "\nCopy this cURL if you want to run it in non-verbose mode.\n\nHere's the result of the cURL:\n" && curl -i --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_1acb0075-zone-web_unlocker1:zl4a7r45evns -k "https://geo.brdtest.com/welcome.txt" && echo -e "\n\nFor additional information visit:\nhttps://docs.brightdata.com/general/account/ssl-certificate\n"

  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (10000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base"),
      $(".a-price.a-text-price")
    );

    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    console.log({ title, currentPrice, originalPrice, outOfStock, images });
   
  } catch (error: any) {
    throw new Error(`Failed to scrape product:${error.message}`);
  }
}
