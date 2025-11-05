const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  console.log("Auth middleware called");
  console.log("Authorization header:", req.headers.authorization);
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("No authorization header");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    console.log("Setting req.user to:", req.user);
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;