import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) return console.log("MONGO_URL is not defined");

  if (isConnected) return console.log("=> using exsisting database connection");
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("mongo db connected");
  } catch (error) {}
};
