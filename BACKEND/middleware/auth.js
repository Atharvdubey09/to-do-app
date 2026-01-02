const jwt = require("jsonwebtoken");

const JWT_SECRET = "MY_SECRET_KEY";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // 1️⃣ Token present hai ya nahi
  if (!authHeader) {
    return res.status(401).send("Token missing");
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  try {
    // 2️⃣ Token verify
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3️⃣ User data request me attach
    req.user = decoded;

    // 4️⃣ Next route allow
    next();

  } catch (error) {
    return res.status(401).send("Invalid token");
  }
}

module.exports = authMiddleware;
