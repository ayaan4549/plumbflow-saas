import mongoose from "mongoose";

const plumberSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  subdomain: { type: String, unique: true },
  authProvider: { type: String, enum: ["email", "google"], default: "email" },
  serviceAreas: [{ type: String }],
  plan: { type: String, enum: ["basic", "pro", "premium"], default: "basic" },
  currency: { type: String, enum: ["GBP", "USD", "EUR"], default: "GBP" },
  smsEnabled: { type: Boolean, default: false },
  emailEnabled: { type: Boolean, default: true },
  smsUsage: { type: Number, default: 0 },
  smsLimit: { type: Number, default: 0 }, // Set based on plan
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Plumber = mongoose.model("Plumber", plumberSchema);
