import express from "express";
import dotenv from "dotenv";
const PORT = process.env.PORT || 8000;

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello, Backend is running!");
});

app.listen(PORT, () =>
	console.log(`Server running on port http://localhost:${PORT}`)
);
