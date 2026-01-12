import express from "express";
import { registerUser, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getUsers);

export default router;
