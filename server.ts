import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import { Plumber } from "./models/Plumber.ts";
import { Booking } from "./models/Booking.ts";
import { SuperAdmin } from "./models/SuperAdmin.ts";
import { Notification } from "./models/Notification.ts";
import { sendSMS } from "./src/services/smsService.ts";
import { sendEmail } from "./src/services/emailService.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/plumbflow";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook needs raw body
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.sendStatus(400);
    
    const sig = req.headers["stripe-signature"] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const { plumberId } = session.metadata;
      const plan = session.amount_total > 5000 ? "premium" : "pro"; // Simple logic for demo

      await Plumber.findByIdAndUpdate(plumberId, { plan });
      
      // Create notification
      await new Notification({
        plumberId,
        title: "Subscription Updated",
        message: `Your plan has been upgraded to ${plan.toUpperCase()}.`,
        type: "payment"
      }).save();
    }

    res.json({ received: true });
  });

  app.use(cors());
  app.use(express.json());

  // MongoDB Connection
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const authenticateAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err || user.role !== "super_admin") return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Auth Endpoints
  app.post("/api/auth/signup", async (req, res) => {
    const { businessName, ownerName, email, password, phone, subdomain } = req.body;

    try {
      const existingPlumber = await Plumber.findOne({ $or: [{ email }, { subdomain }] });
      if (existingPlumber) {
        return res.status(400).json({ error: "Email or subdomain already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const plumber = new Plumber({
        businessName,
        ownerName,
        email,
        password: hashedPassword,
        phone,
        subdomain: subdomain.toLowerCase(),
      });

      await plumber.save();

      // Notify Admin of new signup
      if (process.env.EMAIL_ADMIN) {
        try {
          await sendEmail(
            process.env.EMAIL_ADMIN,
            "New Supplier Signup - PlumbFlow",
            `A new supplier has registered: ${businessName} (${ownerName}).\nEmail: ${email}\nPhone: ${phone}\nSubdomain: ${subdomain}`,
            `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
              <h2 style="color: #2563eb;">New Supplier Signup</h2>
              <p>A new supplier has registered on PlumbFlow.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Business:</strong> ${businessName}</p>
                <p><strong>Owner:</strong> ${ownerName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Subdomain:</strong> ${subdomain}</p>
              </div>
              <a href="${process.env.APP_URL}/admin/suppliers" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Manage Suppliers</a>
            </div>
            `
          );
        } catch (err) {
          console.error("Failed to notify admin of signup:", err);
        }
      }

      const token = jwt.sign({ id: plumber._id, email: plumber.email }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ token, plumber: { id: plumber._id, businessName, ownerName, email, subdomain } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      const plumber = await Plumber.findOne({ email });
      if (!plumber) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      if (plumber.status === "inactive") {
        return res.status(403).json({ error: "Account is inactive. Please contact support." });
      }

      const validPassword = await bcrypt.compare(password, plumber.password);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: plumber._id, email: plumber.email, role: "plumber" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, plumber: { id: plumber._id, businessName: plumber.businessName, ownerName: plumber.ownerName, email: plumber.email, subdomain: plumber.subdomain, role: "plumber" } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/admin/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      // Bootstrap first admin if none exists
      const adminCount = await SuperAdmin.countDocuments();
      if (adminCount === 0 && email === "thuan.musafer@gmail.com") {
        const hashedPassword = await bcrypt.hash(password, 10);
        const firstAdmin = new SuperAdmin({
          email,
          password: hashedPassword,
          name: "Super Admin",
        });
        await firstAdmin.save();
      }

      const admin = await SuperAdmin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: admin._id, email: admin.email, role: "super_admin" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: "super_admin" } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role === "super_admin") {
        const admin = await SuperAdmin.findById(req.user.id).select("-password");
        if (!admin) return res.status(404).json({ error: "User not found" });
        return res.json({ ...admin.toObject(), role: "super_admin" });
      }

      const plumber = await Plumber.findById(req.user.id).select("-password");
      if (!plumber) return res.status(404).json({ error: "User not found" });
      res.json({ ...plumber.toObject(), role: "plumber" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Booking Endpoints
  app.post("/api/bookings", async (req, res) => {
    const { subdomain, customerName, phone, address, jobType, description, date } = req.body;

    try {
      const plumber = await Plumber.findOne({ subdomain: subdomain.toLowerCase() });
      if (!plumber) return res.status(404).json({ error: "Plumber not found" });

      const booking = new Booking({
        plumberId: plumber._id,
        customerName,
        phone,
        address,
        jobType,
        description,
        date: date ? new Date(date) : null,
      });

      await booking.save();

      // Create notification for plumber
      await new Notification({
        plumberId: plumber._id,
        title: "New Booking Request",
        message: `${customerName} has requested a ${jobType} job.`,
        type: "booking"
      }).save();

      // Notify Admin of new booking
      if (process.env.EMAIL_ADMIN) {
        try {
          await sendEmail(
            process.env.EMAIL_ADMIN,
            `New Booking Alert - ${plumber.businessName}`,
            `New booking for ${plumber.businessName} from ${customerName}.\n\nJob Type: ${jobType}\nAddress: ${address}\nPhone: ${phone}`,
            `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
              <h2 style="color: #2563eb;">New Platform Booking</h2>
              <p>A new booking has been created on the platform for <strong>${plumber.businessName}</strong>.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Supplier:</strong> ${plumber.businessName}</p>
                <p><strong>Job Type:</strong> ${jobType}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Phone:</strong> ${phone}</p>
              </div>
              <a href="${process.env.APP_URL}/admin/bookings" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Monitor Bookings</a>
            </div>
            `
          );
        } catch (err) {
          console.error("Failed to notify admin of booking:", err);
        }
      }

      // Send SMS and Email notifications to plumber
      const smsLimit = plumber.plan === "premium" ? Infinity : (plumber.plan === "pro" ? 50 : 0);
      
      // Primary Notification (Email)
      if (plumber.emailEnabled) {
        try {
          await sendEmail(
            plumber.email,
            "New Booking Request - PlumbFlow",
            `New booking from ${customerName}.\n\nJob Type: ${jobType}\nAddress: ${address}\nPhone: ${phone}\nDescription: ${description}`,
            `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
              <h2 style="color: #2563eb;">New Booking Request</h2>
              <p>You have a new job request from <strong>${customerName}</strong>.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Job Type:</strong> ${jobType}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Description:</strong> ${description || "N/A"}</p>
              </div>
              <a href="${process.env.APP_URL}/dashboard/bookings" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Dashboard</a>
            </div>
            `
          );
        } catch (err) {
          console.error("Failed to send email notification:", err);
        }
      }

      // Backup Notification (Email from Admin System)
      try {
        await sendEmail(
          plumber.email,
          "URGENT: New Job Confirmation - PlumbFlow Backup",
          `You have received a new job through PlumbFlow.\n\nCustomer: ${customerName}\nJob: ${jobType}\nAddress: ${address}\nPhone: ${phone}`,
          `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 2px solid #2563eb; border-radius: 10px; padding: 20px;">
            <div style="background: #2563eb; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px; text-align: center; font-weight: bold;">
              BACKUP CONFIRMATION
            </div>
            <h2 style="color: #2563eb;">You have received a new job through PlumbFlow</h2>
            <p>This is a secondary confirmation to ensure you don't miss this opportunity.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Job Type:</strong> ${jobType}</p>
              <p><strong>Address:</strong> ${address}</p>
              <p><strong>Contact Details:</strong> ${phone}</p>
            </div>
            <p style="font-size: 12px; color: #666;">Please log in to your dashboard to manage this booking.</p>
          </div>
          `
        );
      } catch (err) {
        console.error("Failed to send backup email notification:", err);
      }

      if (plumber.smsEnabled && plumber.smsUsage < smsLimit) {
        try {
          await sendSMS(
            plumber.phone,
            `PlumbFlow: New booking from ${customerName}. Job: ${jobType}. Check your dashboard now.`
          );
          await Plumber.findByIdAndUpdate(plumber._id, { $inc: { smsUsage: 1 } });
        } catch (err) {
          console.error("Failed to send SMS notification:", err);
        }
      }

      res.status(201).json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookings = await Booking.find({ plumberId: req.user.id }).sort({ createdAt: -1 });
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      const booking = await Booking.findOneAndUpdate(
        { _id: req.params.id, plumberId: req.user.id },
        { status: req.body.status },
        { new: true }
      );
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      const booking = await Booking.findOneAndDelete({ _id: req.params.id, plumberId: req.user.id });
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      res.json({ message: "Booking deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public Plumber Info
  app.get("/api/plumbers/:subdomain", async (req, res) => {
    try {
      const plumber = await Plumber.findOne({ subdomain: req.params.subdomain.toLowerCase() }).select("-password");
      if (!plumber) return res.status(404).json({ error: "Plumber not found" });
      res.json(plumber);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Customer Booking Retrieval
  app.get("/api/customer-booking", async (req, res) => {
    const { bookingId, phone, subdomain } = req.query;

    try {
      if (bookingId) {
        const booking = await Booking.findById(bookingId).populate("plumberId", "-password");
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        return res.json(booking);
      }

      if (phone && subdomain) {
        const plumber = await Plumber.findOne({ subdomain: (subdomain as string).toLowerCase() });
        if (!plumber) return res.status(404).json({ error: "Plumber not found" });

        const bookings = await Booking.find({ 
          phone: phone as string, 
          plumberId: plumber._id 
        }).sort({ createdAt: -1 }).populate("plumberId", "-password");
        
        if (bookings.length === 0) return res.status(404).json({ error: "No bookings found for this phone number" });
        
        // If plumber is not premium, only return the most recent one
        if (plumber.plan !== "premium") {
          return res.json(bookings[0]);
        }
        
        return res.json(bookings);
      }

      res.status(400).json({ error: "Provide bookingId OR phone and subdomain" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/plumbers/:subdomain", authenticateToken, async (req: any, res) => {
    try {
      const plumber = await Plumber.findOneAndUpdate(
        { subdomain: req.params.subdomain.toLowerCase(), _id: req.user.id },
        { 
          businessName: req.body.businessName,
          ownerName: req.body.ownerName,
          phone: req.body.phone,
          serviceAreas: req.body.serviceAreas,
          smsEnabled: req.body.smsEnabled,
          emailEnabled: req.body.emailEnabled,
          currency: req.body.currency,
        },
        { new: true }
      ).select("-password");
      
      if (!plumber) return res.status(404).json({ error: "Plumber not found" });
      res.json(plumber);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notification Endpoints
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notifications = await Notification.find({ plumberId: req.user.id }).sort({ createdAt: -1 }).limit(20);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
    try {
      await Notification.findOneAndUpdate({ _id: req.params.id, plumberId: req.user.id }, { read: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics Endpoint
  app.get("/api/analytics", authenticateToken, async (req: any, res) => {
    try {
      const plumber = await Plumber.findById(req.user.id);
      if (!plumber) return res.status(404).json({ error: "Plumber not found" });

      const bookings = await Booking.find({ plumberId: req.user.id });
      
      // Simple analytics calculation
      const totalRevenue = bookings.filter(b => b.status === "completed").length * 80; // Assuming £80 avg job
      const monthlyBookings = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const count = bookings.filter(b => {
          const bDate = new Date(b.createdAt);
          return bDate.getMonth() === date.getMonth() && bDate.getFullYear() === date.getFullYear();
        }).length;
        return { month, count };
      }).reverse();

      res.json({
        totalRevenue,
        monthlyBookings,
        jobTypes: [
          { name: "Boiler Repair", count: bookings.filter(b => b.jobType === "Boiler Repair").length },
          { name: "Leak Fix", count: bookings.filter(b => b.jobType === "Leak Fix").length },
          { name: "General Plumbing", count: bookings.filter(b => b.jobType === "General Plumbing").length },
        ]
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id/view", authenticateToken, async (req: any, res) => {
    try {
      const booking = await Booking.findOneAndUpdate(
        { _id: req.params.id, plumberId: req.user.id },
        { viewedBySupplier: true },
        { new: true }
      );
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Management Endpoints
  app.get("/api/admin/stats", authenticateAdmin, async (req, res) => {
    try {
      const plumberCount = await Plumber.countDocuments();
      const bookingCount = await Booking.countDocuments();
      const activeSubscriptions = await Plumber.countDocuments({ plan: { $ne: "basic" } });
      
      // Mock revenue calculation
      const mrr = activeSubscriptions * 69; // Average plan price (approx avg of 59 and 99)

      res.json({
        plumberCount,
        bookingCount,
        activeSubscriptions,
        mrr
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/plumbers", authenticateAdmin, async (req, res) => {
    try {
      const plumbers = await Plumber.find().select("-password").sort({ createdAt: -1 });
      res.json(plumbers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/bookings", authenticateAdmin, async (req, res) => {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 }).populate("plumberId", "businessName");
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/plumbers/:id", authenticateAdmin, async (req, res) => {
    try {
      const { plan, status, smsLimit } = req.body;
      const plumber = await Plumber.findByIdAndUpdate(
        req.params.id,
        { plan, status, smsLimit },
        { new: true }
      ).select("-password");
      
      if (!plumber) return res.status(404).json({ error: "Plumber not found" });
      res.json(plumber);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/analytics", authenticateAdmin, async (req, res) => {
    try {
      const plumbers = await Plumber.find();
      const bookings = await Booking.find();

      // Bookings per day (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        return d;
      }).reverse();

      const bookingsPerDay = last30Days.map(date => {
        const count = bookings.filter(b => {
          const bDate = new Date(b.createdAt);
          bDate.setHours(0, 0, 0, 0);
          return bDate.getTime() === date.getTime();
        }).length;
        return { date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), count };
      });

      // Supplier growth (last 6 months)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        d.setHours(0, 0, 0, 0);
        return d;
      }).reverse();

      const supplierGrowth = last6Months.map(date => {
        const count = plumbers.filter(p => {
          const pDate = new Date(p.createdAt || Date.now());
          return pDate.getMonth() <= date.getMonth() && pDate.getFullYear() <= date.getFullYear();
        }).length;
        return { month: date.toLocaleString('default', { month: 'short' }), count };
      });

      // Plan distribution
      const planDistribution = [
        { name: "Basic", value: plumbers.filter(p => p.plan === "basic").length },
        { name: "Pro", value: plumbers.filter(p => p.plan === "pro").length },
        { name: "Premium", value: plumbers.filter(p => p.plan === "premium").length },
      ];

      res.json({
        bookingsPerDay,
        supplierGrowth,
        planDistribution,
        totalSmsUsage: plumbers.reduce((acc, p) => acc + (p.smsUsage || 0), 0),
        backupSmsCount: bookings.filter(b => b.backupSmsSent).length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", authenticateToken, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const { priceId } = req.body;

    try {
      const plumber = await Plumber.findById(req.user.id);
      if (!plumber) return res.status(404).json({ error: "Plumber not found" });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/pricing`,
        metadata: {
          plumberId: plumber._id.toString(),
          subdomain: plumber.subdomain,
        },
      });

      res.json({ id: session.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.post("/api/admin/trigger-summary", authenticateAdmin, async (req, res) => {
    await sendDailySummary();
    res.json({ message: "Summary email triggered" });
  });

  // Daily Summary Email (Run every 24 hours)
  const sendDailySummary = async () => {
    if (!process.env.EMAIL_ADMIN) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [plumbersToday, bookingsToday, totalSms] = await Promise.all([
        Plumber.countDocuments({ createdAt: { $gte: today } }),
        Booking.countDocuments({ createdAt: { $gte: today } }),
        Plumber.aggregate([{ $group: { _id: null, total: { $sum: "$smsUsage" } } }])
      ]);

      const totalSmsUsage = totalSms[0]?.total || 0;

      await sendEmail(
        process.env.EMAIL_ADMIN,
        `PlumbFlow Daily Summary - ${today.toLocaleDateString()}`,
        `Daily summary for ${today.toLocaleDateString()}:\nNew Suppliers: ${plumbersToday}\nNew Bookings: ${bookingsToday}\nTotal Platform SMS Usage: ${totalSmsUsage}`,
        `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
          <h2 style="color: #2563eb;">Daily Platform Summary</h2>
          <p>Here is the performance summary for <strong>${today.toLocaleDateString()}</strong>.</p>
          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #2563eb;">${plumbersToday}</p>
              <p style="font-size: 12px; color: #64748b; margin: 5px 0 0; text-transform: uppercase; font-weight: bold;">New Suppliers</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #2563eb;">${bookingsToday}</p>
              <p style="font-size: 12px; color: #64748b; margin: 5px 0 0; text-transform: uppercase; font-weight: bold;">New Bookings</p>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Total Platform SMS Usage:</strong> ${totalSmsUsage}</p>
          </div>
          <a href="${process.env.APP_URL}/admin" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Full Dashboard</a>
        </div>
        `
      );
      console.log("Daily summary email sent.");
    } catch (err) {
      console.error("Failed to send daily summary email:", err);
    }
  };

  // Run every 24 hours (86400000 ms)
  setInterval(sendDailySummary, 24 * 60 * 60 * 1000);

  // Backup SMS Reminder System (Run every minute)
  const checkBackupSMS = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

      const pendingBookings = await Booking.find({
        viewedBySupplier: false,
        backupSmsSent: false,
        status: "pending",
        createdAt: { $gte: fiveMinutesAgo, $lte: twoMinutesAgo }
      }).populate("plumberId");

      for (const booking of pendingBookings) {
        const plumber = booking.plumberId as any;
        if (!plumber || !["pro", "premium"].includes(plumber.plan)) continue;

        // Check SMS limits
        const smsLimit = plumber.smsLimit || (plumber.plan === "premium" ? 500 : (plumber.plan === "pro" ? 100 : 0));
        if (plumber.smsUsage >= smsLimit) continue;

        // Send Backup SMS
        try {
          await sendSMS(
            plumber.phone,
            `Reminder: You have a new job on PlumbFlow. Please check your dashboard.`
          );

          // Update booking and plumber usage
          booking.backupSmsSent = true;
          await booking.save();

          plumber.smsUsage += 1;
          await plumber.save();

          // Create notification for plumber
          await new Notification({
            plumberId: plumber._id,
            title: "Backup SMS Reminder Sent",
            message: `A secondary SMS reminder was sent for the booking from ${booking.customerName}.`,
            type: "system"
          }).save();

          console.log(`Backup SMS sent for booking ${booking._id} to ${plumber.businessName}`);
        } catch (err) {
          console.error(`Failed to send backup SMS for booking ${booking._id}:`, err);
        }
      }
    } catch (err) {
      console.error("Error in backup SMS check:", err);
    }
  };

  // Run backup SMS check every minute
  setInterval(checkBackupSMS, 60 * 1000);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
