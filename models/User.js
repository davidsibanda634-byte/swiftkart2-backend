import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    phone: {
      type: String,
      required: true,
    },

    location: {
      country: { type: String },
      city: { type: String },
      area: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);