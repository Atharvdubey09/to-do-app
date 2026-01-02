const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const authMiddleware = require("./middleware/auth");
const cors = require('cors');

const app = express();
app.use(cors({ origin: true, credentials: true }));

/* ================= HOME ================= */
app.get("/", (req, res) => {
  res.send("Server OK");
});


/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
  try {
    // 1️⃣ Frontend se data lo
    const { name, email, password } = req.body;

    // 2️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 3️⃣ Check email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // 4️⃣ Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Insert user
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    // 6️⃣ Response
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
  console.log("Login request body:", req.body);
  try {
    // 1️⃣ FRONTEND SE DATA LO
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // 2️⃣ USER FETCH
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // 3️⃣ PASSWORD MATCH
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 4️⃣ JWT CREATE
    const token = jwt.sign(
      { id: user.id, email: user.email },
      "MY_SECRET_KEY",
      { expiresIn: "1h" }
    );

    // 5️⃣ RESPONSE
    res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});



/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});


// 🔐 VERIFY TOKEN FUNCTION
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).send("Token missing");
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN

  jwt.verify(token, "MY_SECRET_KEY", (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token");
    }

    req.user = decoded;
    next();
  });
}

// 🧠 PHIR ROUTE
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user,
  });
});

app.post("/todos", verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id; // JWT se

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

//get todos route
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

//delete todo route
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




