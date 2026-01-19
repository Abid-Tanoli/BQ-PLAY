import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const { id, role } = decoded;
    if (role === "admin") {
      const admin = await Admin.findById(id).select("-password");
      if (!admin) return res.status(401).json({ message: "Not authorized" });
      req.user = admin;
    } else {
      const user = await User.findById(id).select("-password");
      if (!user) return res.status(401).json({ message: "Not authorized" });
      req.user = user;
    }

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