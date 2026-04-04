import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: "super_admin" },
}, { timestamps: true });

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
