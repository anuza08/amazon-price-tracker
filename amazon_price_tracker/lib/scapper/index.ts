import axios from "axios";
import * as cheerio from "cheerio";
import { log } from "console";

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
    //fetch product page
    const response = await axios.get(url, options);
    debugger;
    console.log(response.data);
  } catch (error: any) {
    throw new Error(`Failed to scrape product:${error.message}`);
  }
}
