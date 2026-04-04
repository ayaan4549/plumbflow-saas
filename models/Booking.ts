import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  plumberId: { type: mongoose.Schema.Types.ObjectId, ref: "Plumber", required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  jobType: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  viewedBySupplier: { type: Boolean, default: false },
  backupSmsSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Booking = mongoose.model("Booking", bookingSchema);
