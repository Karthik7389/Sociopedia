import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:6001'],
  credentials: true
}));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* TEST ROUTE */
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
mongoose.set("strictQuery", true);

const PORT = process.env.PORT || 6001;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/socialpedia";

console.log('Attempting to connect to MongoDB at:', MONGO_URL);

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Successfully connected to MongoDB');
    app.listen(PORT, 'localhost', () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log('Available routes:');
      console.log('- POST /auth/register - Register a new user');
      console.log('- POST /auth/login - Login');
      console.log('- GET  /users - Get users');
      console.log('- GET  /posts - Get posts');
    });

    /* ADD DATA ONE TIME */
    //User.insertMany(users);
    //Post.insertMany(posts);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    console.log('Please ensure MongoDB is running and the connection URL is correct');
    process.exit(1);
  });
