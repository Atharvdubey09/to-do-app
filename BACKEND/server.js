const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const authMiddleware = require("./middleware/auth");
const cors = require('cors');

const app = express();

// 1. IMPORTANT: Frontend se JSON data read karne ke liye ye zaruri hai
app.use(express.json());

// 2. UPDATED CORS: Ye Vercel aur Local dono par kaam karega
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/* ================= HOME ================= */
app.get("/", (req, res) => {
  res.send("Server OK - Backend is Live 🚀");
});

/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Signup successful",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("SIGNUP ERROR 👉", error);
    res.status(500).json({ message: "Signup failed" });
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "MY_SECRET_KEY",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

// 🔐 VERIFY TOKEN FUNCTION
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).send("Token missing");
  }

  const token = authHeader.split(" ")[1]; 

  jwt.verify(token, "MY_SECRET_KEY", (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token");
    }

    req.user = decoded;
    next();
  });
}

/* ================= PROTECTED ROUTES ================= */
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user,
  });
});

app.post("/todos", verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).send("Title required");
    }

    const result = await pool.query(
      "INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING *",
      [userId, title]
    );

    res.json({
      message: "Todo added",
      todo: result.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add todo");
  }
});

app.get("/todos", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch todos");
  }
});

app.delete("/todos/:id", verifyToken, async (req, res) => {
  try {
    const todoId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *",
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).send("Not allowed or todo not found");
    }

    res.send("Todo deleted");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete todo");
  }
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});