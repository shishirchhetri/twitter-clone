import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";

import connectMongo from "./db/connectMongoDB.js";

dotenv.config();
//cloudinary image update config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT;
//for parsing jwt cookie token
app.use(cookieParser());
//middleware to parse data from frontend
app.use(express.json());
//parse form data (url encoded)
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongo();
});
