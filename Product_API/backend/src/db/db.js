import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("Server is connected to DB successfully");
  } catch (err) {
    console.error("Server is failed to connect with DB", err);

    throw err;
  }
};

export default connectToDB;
