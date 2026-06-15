import mongoose from "mongoose";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message;

  if (err instanceof mongoose.Error.CastError && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `Duplicate value for '${field}'` : "Duplicate key error";
  }

  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
