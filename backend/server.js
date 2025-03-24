import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

console.log(process.env.MONGO_URI);

app.use(express.json());
app.use("/api/users", userRoutes);
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
