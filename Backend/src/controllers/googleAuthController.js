import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        role: "viewer",
        accountType: "viewer",
      });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        picture,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
}

export async function googleAdminLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      if (user.role !== "admin" && user.role !== "scorer") {
        return res.status(403).json({ message: "Not authorized as admin. Use a different account." });
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        role: "scorer",
        accountType: "handler",
      });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        picture,
      },
    });
  } catch (error) {
    console.error("Google admin auth error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
}
