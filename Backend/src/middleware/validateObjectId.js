import mongoose from "mongoose";

const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid '${paramName}' parameter`,
      });
    }
    next();
  };
};

export default validateObjectId;