import jwt from "jsonwebtoken";

export const generateAccessToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });