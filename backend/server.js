import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRoute from "./routes/auth.routes.js";
import connectMongo from "./db/connectMongoDB.js";

const app = express();
const PORT = process.env.PORT;

//middleware to parse data from frontend
app.use(express.json());
//parse form data (url encoded)
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongo();
});
