import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer"))
      return res.status(401).json({ message: "Not authorized, no token" });

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.user = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin role required" });
  next();
};

export default { protect, requireAdmin };
