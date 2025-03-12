import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

function connectToMongoDB() {
  try {
    mongoose
      .connect(process.env.Drive_DB_URL as string)
      .then(() => console.log("Connected to MongoDB"));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export default connectToMongoDB;
