import express from "express";
import {
  registerAdmin,
  loginAdmin,
  listAdmins,
  getAdminProfile,
  updateAdmin,
  deleteAdmin,
} from "../controllers/adminController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/profile", auth.protect, getAdminProfile);

router.get("/", auth.protect, auth.requireAdmin, listAdmins);
router.put("/:id", auth.protect, auth.requireAdmin, updateAdmin);
router.delete("/:id", auth.protect, auth.requireAdmin, deleteAdmin);

export default router;