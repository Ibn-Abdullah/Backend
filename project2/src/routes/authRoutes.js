import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// Register a new user endpoint /auth/register
router.post("/register", (req, res) => {
	console.log("Registration attempt:", req.body);

	const { username, password } = req.body;

	// Validation
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	if (password.length < 6) {
		return res
			.status(400)
			.json({ message: "Password must be at least 6 characters" });
	}

	try {
		// Check if JWT_SECRET exists
		if (!process.env.JWT_SECRET) {
			console.error("JWT_SECRET is not defined in environment variables");
			return res.status(500).json({ message: "Server configuration error" });
		}

		// encrypt the password
		const hashedPassword = bcrypt.hashSync(password, 8);

		// save the new user and hashed password to the db
		const insertUser = db.prepare(
			`INSERT INTO users (username, password) VALUES (?, ?)`
		);
		const result = insertUser.run(username, hashedPassword);

		// now that we have a user, add their first todo
		const defaultTodo = `Hello :) Add your first todo!`;
		const insertTodo = db.prepare(
			`INSERT INTO todos (user_id, task, completed) VALUES (?, ?, ?)`
		);
		insertTodo.run(result.lastInsertRowid, defaultTodo, 0);

		// create a token
		const token = jwt.sign(
			{ id: result.lastInsertRowid },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);

		console.log("User registered successfully:", result.lastInsertRowid);
		res.json({ token });
	} catch (err) {
		console.error("Registration error:", err);
		if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
			return res.status(409).json({ message: "User already exists" });
		}
		res.status(500).json({ message: "Registration failed" });
	}
});

router.post("/login", (req, res) => {
	console.log("Login attempt:", req.body);

	const { username, password } = req.body;

	// Validation
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	try {
		// Check if JWT_SECRET exists
		if (!process.env.JWT_SECRET) {
			console.error("JWT_SECRET is not defined in environment variables");
			return res.status(500).json({ message: "Server configuration error" });
		}

		const getUser = db.prepare("SELECT * FROM users WHERE username = ?");
		const user = getUser.get(username);

		// if we cannot find a user associated with that username
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const passwordIsValid = bcrypt.compareSync(password, user.password);
		// if the password does not match
		if (!passwordIsValid) {
			return res.status(401).json({ message: "Invalid password" });
		}

		console.log("User logged in successfully:", user.id);

		// successful authentication
		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});
		res.json({ token });
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ message: "Login failed" });
	}
});

export default router;
