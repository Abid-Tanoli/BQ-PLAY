import User from "../models/User.js";
import Player from "../models/Player.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      accountType = "viewer",
      organizationCategory = "",
      organizationName = "",
      phone = "",
      joinIntent = "",
      playerProfile
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const requestedType = ["player", "handler", "organization_admin", "viewer"].includes(accountType)
      ? accountType
      : "viewer";
    const role = requestedType === "handler" || requestedType === "organization_admin" ? "scorer" : "viewer";

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      accountType: requestedType,
      organizationCategory,
      organizationName,
      phone,
      joinIntent
    });

    if (requestedType === "player" && playerProfile) {
      await Player.create({
        name,
        playingRole: playerProfile.playingRole || "",
        battingStyle: playerProfile.battingStyle || "",
        bowlingStyle: playerProfile.bowlingStyle || "",
        category: playerProfile.category || "Other",
        subCategory: playerProfile.subCategory || "",
        ageGroup: playerProfile.ageGroup || "Open",
        organization: playerProfile.organizationName || "",
        address: {
          town: playerProfile.location?.town || "",
          district: playerProfile.location?.district || "",
          city: playerProfile.location?.city || "",
          province: playerProfile.location?.province || "",
          country: "Pakistan"
        },
      });
    }

    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        accountType: newUser.accountType,
        organizationCategory: newUser.organizationCategory,
        organizationName: newUser.organizationName,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Attempt:", email);

    if (!email || !password) {
      console.log("Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("password not matched")
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    console.log("Login Successful for:", email);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        organizationCategory: user.organizationCategory,
        organizationName: user.organizationName,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
      organizationCategory: user.organizationCategory,
      organizationName: user.organizationName,
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Profile fetch failed" });
  }
};
