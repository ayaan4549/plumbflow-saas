import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  plumberId: { type: mongoose.Schema.Types.ObjectId, ref: "Plumber", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["booking", "system", "payment"], default: "booking" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model("Notification", notificationSchema);
