import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
// Get the directory name from the file path
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());

// CORS middleware for development
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	next();
});

// Serves the HTML file from the /public directory
// Tells express to serve all files from the public folder as static assets
app.use(express.static(path.join(__dirname, "../public")));

// Routes - IMPORTANT: API routes must come BEFORE the catch-all route
app.use("/auth", authRoutes);
app.use("/todos", authMiddleware, todoRoutes);

// Serving up the HTML file from the /public directory (catch-all route)
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Server Error:", err);
	res.status(500).json({
		message: "Internal server error",
		error:
			process.env.NODE_ENV === "development"
				? err.message
				: "Something went wrong",
	});
});

app.listen(PORT, () => {
	console.log(`Server has started on port: ${PORT}`);
	console.log(`Visit: http://localhost:${PORT}`);
});
