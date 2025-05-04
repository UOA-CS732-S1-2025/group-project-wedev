import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import conversationRoutes from "./routes/conversation.route.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

console.log(process.env.MONGO_URI);

app.use(express.json());
app.use("/api/users", userRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);


//Only used to test whether the backend is actually started, delete before deployment
app.get("/", (req, res) => {
  res.send("BACKEND is running"); 
});



app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
