import User from "../models/User.js";

// REGISTER
export const registerUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};

// GET users
export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};
