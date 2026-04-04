import mongoose from "mongoose";

const plumberSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  serviceAreas: [{ type: String }],
  plan: { type: String, enum: ["basic", "pro", "premium"], default: "basic" },
  currency: { type: String, enum: ["GBP", "USD", "EUR"], default: "GBP" },
  smsEnabled: { type: Boolean, default: false },
  emailEnabled: { type: Boolean, default: true },
  smsUsage: { type: Number, default: 0 },
  smsLimit: { type: Number, default: 0 }, // Set based on plan
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Plumber = mongoose.model("Plumber", plumberSchema);
