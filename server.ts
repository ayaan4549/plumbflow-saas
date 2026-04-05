import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import type { Plumber, Booking, SuperAdmin, Notification } from "./src/types/database.ts";
import { sendSMS } from "./src/services/smsService.ts";
import { sendEmail } from "./src/services/emailService.ts";
import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Initialize Firebase Admin
if (!admin.apps.length) {
  console.log("Initializing Firebase Admin with project ID:", firebaseConfig.projectId);
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

console.log("Initializing Firestore with database ID:", firebaseConfig.firestoreDatabaseId);
const db = getFirestore(firebaseConfig.firestoreDatabaseId);
const plumbersCol = db.collection("plumbers");
const bookingsCol = db.collection("bookings");
const adminsCol = db.collection("admins");
const notificationsCol = db.collection("notifications");

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

      try {
        await plumbersCol.doc(plumberId).update({ plan });
        
        // Create notification
        const notification: Notification = {
          plumberId,
          title: "Subscription Updated",
          message: `Your plan has been upgraded to ${plan.toUpperCase()}.`,
          type: "payment",
          read: false,
          createdAt: new Date().toISOString(),
        };
        await notificationsCol.add(notification);
      } catch (err) {
        console.error("Failed to update plumber after checkout:", err);
      }
    }

    res.json({ received: true });
  });

  app.use(cors());
  app.use(express.json());

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
      const emailSnap = await plumbersCol.where("email", "==", email).get();
      const subdomainSnap = await plumbersCol.where("subdomain", "==", subdomain.toLowerCase()).get();
      
      if (!emailSnap.empty || !subdomainSnap.empty) {
        return res.status(400).json({ error: "Email or subdomain already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const plumber: Plumber = {
        businessName,
        ownerName,
        email,
        password: hashedPassword,
        phone,
        subdomain: subdomain.toLowerCase(),
        authProvider: "email",
        serviceAreas: [],
        plan: "basic",
        currency: "GBP",
        smsEnabled: false,
        emailEnabled: true,
        smsUsage: 0,
        smsLimit: 0,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      const docRef = await plumbersCol.add(plumber);
      const plumberId = docRef.id;

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

      const token = jwt.sign({ id: plumberId, email: plumber.email }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ token, plumber: { id: plumberId, businessName, ownerName, email, subdomain } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/google", async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "ID Token is required" });
    }

    try {
      console.log("Verifying Google ID Token...");
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { email, name, uid } = decodedToken;
      console.log("Verified email:", email);

      if (!email) {
        return res.status(400).json({ error: "Email not found in Google account" });
      }

      const plumberSnap = await plumbersCol.where("email", "==", email).get();
      let plumber: Plumber | null = null;
      let plumberId: string | null = null;

      if (plumberSnap.empty) {
        // Create new plumber
        const baseSubdomain = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "") : email.split("@")[0].replace(/[^a-z0-9]/g, "");
        let subdomain = baseSubdomain || "plumber";
        let counter = 1;
        
        while (!(await plumbersCol.where("subdomain", "==", subdomain).get()).empty) {
          subdomain = `${baseSubdomain}${counter}`;
          counter++;
        }

        const newPlumber: Plumber = {
          businessName: name || "New Business",
          ownerName: name || "New Owner",
          email,
          subdomain,
          authProvider: "google",
          phone: "Not provided",
          serviceAreas: [],
          plan: "basic",
          currency: "GBP",
          smsEnabled: false,
          emailEnabled: true,
          smsUsage: 0,
          smsLimit: 0,
          status: "active",
          createdAt: new Date().toISOString(),
          uid,
        };
        const docRef = await plumbersCol.add(newPlumber);
        plumber = newPlumber;
        plumberId = docRef.id;

        // Notify Admin of new signup
        if (process.env.EMAIL_ADMIN) {
          try {
            await sendEmail(
              process.env.EMAIL_ADMIN,
              "New Supplier Signup (Google) - PlumbFlow",
              `A new supplier has registered via Google: ${plumber.businessName}.\nEmail: ${email}\nSubdomain: ${subdomain}`,
              `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <h2 style="color: #2563eb;">New Supplier Signup (Google)</h2>
                <p>A new supplier has registered on PlumbFlow using Google.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Business:</strong> ${plumber.businessName}</p>
                  <p><strong>Email:</strong> ${email}</p>
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
      } else {
        plumber = plumberSnap.docs[0].data() as Plumber;
        plumberId = plumberSnap.docs[0].id;
      }

      if (plumber.status === "inactive") {
        return res.status(403).json({ error: "Account is inactive. Please contact support." });
      }

      const token = jwt.sign({ id: plumberId, email: plumber.email, role: "plumber" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, plumber: { id: plumberId, businessName: plumber.businessName, ownerName: plumber.ownerName, email: plumber.email, subdomain: plumber.subdomain, role: "plumber" } });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      const plumberSnap = await plumbersCol.where("email", "==", email).get();
      if (plumberSnap.empty) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const plumberDoc = plumberSnap.docs[0];
      const plumber = plumberDoc.data() as Plumber;
      const plumberId = plumberDoc.id;

      if (plumber.status === "inactive") {
        return res.status(403).json({ error: "Account is inactive. Please contact support." });
      }

      const validPassword = await bcrypt.compare(password, plumber.password || "");
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: plumberId, email: plumber.email, role: "plumber" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, plumber: { id: plumberId, businessName: plumber.businessName, ownerName: plumber.ownerName, email: plumber.email, subdomain: plumber.subdomain, role: "plumber" } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/admin/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      // Bootstrap first admin if none exists
      const adminCount = (await adminsCol.get()).size;
      if (adminCount === 0 && email === "thuan.musafer@gmail.com") {
        const hashedPassword = await bcrypt.hash(password, 10);
        const firstAdmin: SuperAdmin = {
          email,
          password: hashedPassword,
          name: "Super Admin",
          role: "super_admin",
          createdAt: new Date().toISOString(),
        };
        await adminsCol.add(firstAdmin);
      }

      const adminSnap = await adminsCol.where("email", "==", email).get();
      if (adminSnap.empty) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const adminDoc = adminSnap.docs[0];
      const admin = adminDoc.data() as SuperAdmin;
      const adminId = adminDoc.id;

      const validPassword = await bcrypt.compare(password, admin.password || "");
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: adminId, email: admin.email, role: "super_admin" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, admin: { id: adminId, name: admin.name, email: admin.email, role: "super_admin" } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role === "super_admin") {
        const adminDoc = await adminsCol.doc(req.user.id).get();
        if (!adminDoc.exists) return res.status(404).json({ error: "User not found" });
        const adminData = adminDoc.data() as SuperAdmin;
        delete adminData.password;
        return res.json({ ...adminData, id: adminDoc.id, role: "super_admin" });
      }

      const plumberDoc = await plumbersCol.doc(req.user.id).get();
      if (!plumberDoc.exists) return res.status(404).json({ error: "User not found" });
      const plumberData = plumberDoc.data() as Plumber;
      delete plumberData.password;
      res.json({ ...plumberData, id: plumberDoc.id, role: "plumber" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Booking Endpoints
  app.post("/api/bookings", async (req, res) => {
    const { subdomain, customerName, phone, address, jobType, description, date } = req.body;

    try {
      const plumberSnap = await plumbersCol.where("subdomain", "==", subdomain.toLowerCase()).get();
      if (plumberSnap.empty) return res.status(404).json({ error: "Plumber not found" });

      const plumberDoc = plumberSnap.docs[0];
      const plumber = plumberDoc.data() as Plumber;
      const plumberId = plumberDoc.id;

      const booking: Booking = {
        plumberId,
        customerName,
        phone,
        address,
        jobType,
        description,
        date: date ? new Date(date).toISOString() : null,
        status: "pending",
        viewedBySupplier: false,
        backupSmsSent: false,
        createdAt: new Date().toISOString(),
      };

      const docRef = await bookingsCol.add(booking);
      const bookingId = docRef.id;

      // Create notification for plumber
      const notification: Notification = {
        plumberId,
        title: "New Booking Request",
        message: `${customerName} has requested a ${jobType} job.`,
        type: "booking",
        read: false,
        createdAt: new Date().toISOString(),
      };
      await notificationsCol.add(notification);

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

      if (plumber.smsEnabled && plumber.smsUsage < smsLimit && plumber.phone) {
        try {
          await sendSMS(
            plumber.phone,
            `PlumbFlow: New booking from ${customerName}. Job: ${jobType}. Check your dashboard now.`
          );
          await plumbersCol.doc(plumberId).update({ smsUsage: admin.firestore.FieldValue.increment(1) });
        } catch (err) {
          console.error("Failed to send SMS notification:", err);
        }
      }

      res.status(201).json({ ...booking, id: bookingId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookingsSnap = await bookingsCol.where("plumberId", "==", req.user.id).orderBy("createdAt", "desc").get();
      const bookings = bookingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      const bookingRef = bookingsCol.doc(req.params.id);
      const bookingDoc = await bookingRef.get();
      
      if (!bookingDoc.exists || bookingDoc.data()?.plumberId !== req.user.id) {
        return res.status(404).json({ error: "Booking not found" });
      }

      await bookingRef.update({ status: req.body.status });
      const updatedBooking = (await bookingRef.get()).data();
      res.json({ ...updatedBooking, id: bookingRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      const bookingRef = bookingsCol.doc(req.params.id);
      const bookingDoc = await bookingRef.get();
      
      if (!bookingDoc.exists || bookingDoc.data()?.plumberId !== req.user.id) {
        return res.status(404).json({ error: "Booking not found" });
      }

      await bookingRef.delete();
      res.json({ message: "Booking deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public Plumber Info
  app.get("/api/plumbers/:subdomain", async (req, res) => {
    try {
      const plumberSnap = await plumbersCol.where("subdomain", "==", req.params.subdomain.toLowerCase()).get();
      if (plumberSnap.empty) return res.status(404).json({ error: "Plumber not found" });
      const plumber = plumberSnap.docs[0].data() as Plumber;
      delete plumber.password;
      res.json({ ...plumber, id: plumberSnap.docs[0].id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Customer Booking Retrieval
  app.get("/api/customer-booking", async (req, res) => {
    const { bookingId, phone, subdomain } = req.query;

    try {
      if (bookingId) {
        const bookingDoc = await bookingsCol.doc(bookingId as string).get();
        if (!bookingDoc.exists) return res.status(404).json({ error: "Booking not found" });
        const booking = bookingDoc.data() as Booking;
        const plumberDoc = await plumbersCol.doc(booking.plumberId).get();
        const plumber = plumberDoc.data() as Plumber;
        delete plumber.password;
        return res.json({ ...booking, id: bookingDoc.id, plumberId: { ...plumber, id: plumberDoc.id } });
      }

      if (phone && subdomain) {
        const plumberSnap = await plumbersCol.where("subdomain", "==", (subdomain as string).toLowerCase()).get();
        if (plumberSnap.empty) return res.status(404).json({ error: "Plumber not found" });
        const plumberDoc = plumberSnap.docs[0];
        const plumberId = plumberDoc.id;
        const plumberData = plumberDoc.data() as Plumber;

        const bookingsSnap = await bookingsCol
          .where("phone", "==", phone as string)
          .where("plumberId", "==", plumberId)
          .orderBy("createdAt", "desc")
          .get();
        
        if (bookingsSnap.empty) return res.status(404).json({ error: "No bookings found for this phone number" });
        
        const bookings = await Promise.all(bookingsSnap.docs.map(async doc => {
          const b = doc.data() as Booking;
          const pDoc = await plumbersCol.doc(b.plumberId).get();
          const pData = pDoc.data() as Plumber;
          delete pData.password;
          return { ...b, id: doc.id, plumberId: { ...pData, id: pDoc.id } };
        }));
        
        // If plumber is not premium, only return the most recent one
        if (plumberData.plan !== "premium") {
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
      const plumberRef = plumbersCol.doc(req.user.id);
      const plumberDoc = await plumberRef.get();
      
      if (!plumberDoc.exists || plumberDoc.data()?.subdomain !== req.params.subdomain.toLowerCase()) {
        return res.status(404).json({ error: "Plumber not found" });
      }

      const updateData = { 
        businessName: req.body.businessName,
        ownerName: req.body.ownerName,
        phone: req.body.phone,
        serviceAreas: req.body.serviceAreas,
        smsEnabled: req.body.smsEnabled,
        emailEnabled: req.body.emailEnabled,
        currency: req.body.currency,
      };

      await plumberRef.update(updateData);
      const updatedPlumber = (await plumberRef.get()).data() as Plumber;
      delete updatedPlumber.password;
      res.json({ ...updatedPlumber, id: plumberRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notification Endpoints
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notificationsSnap = await notificationsCol
        .where("plumberId", "==", req.user.id)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();
      const notifications = notificationsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
    try {
      const notificationRef = notificationsCol.doc(req.params.id);
      const notificationDoc = await notificationRef.get();
      if (!notificationDoc.exists || notificationDoc.data()?.plumberId !== req.user.id) {
        return res.status(404).json({ error: "Notification not found" });
      }
      await notificationRef.update({ read: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics Endpoint
  app.get("/api/analytics", authenticateToken, async (req: any, res) => {
    try {
      const plumberDoc = await plumbersCol.doc(req.user.id).get();
      if (!plumberDoc.exists) return res.status(404).json({ error: "Plumber not found" });

      const bookingsSnap = await bookingsCol.where("plumberId", "==", req.user.id).get();
      const bookings = bookingsSnap.docs.map(doc => doc.data() as Booking);
      
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
      const bookingRef = bookingsCol.doc(req.params.id);
      const bookingDoc = await bookingRef.get();
      if (!bookingDoc.exists || bookingDoc.data()?.plumberId !== req.user.id) {
        return res.status(404).json({ error: "Booking not found" });
      }
      await bookingRef.update({ viewedBySupplier: true });
      const updatedBooking = (await bookingRef.get()).data();
      res.json({ ...updatedBooking, id: bookingRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Management Endpoints
  app.get("/api/admin/stats", authenticateAdmin, async (req, res) => {
    try {
      const plumberCount = (await plumbersCol.get()).size;
      const bookingCount = (await bookingsCol.get()).size;
      const activeSubscriptionsSnap = await plumbersCol.where("plan", "!=", "basic").get();
      const activeSubscriptions = activeSubscriptionsSnap.size;
      
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
      const plumbersSnap = await plumbersCol.orderBy("createdAt", "desc").get();
      const plumbers = plumbersSnap.docs.map(doc => {
        const data = doc.data() as Plumber;
        delete data.password;
        return { ...data, id: doc.id };
      });
      res.json(plumbers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/bookings", authenticateAdmin, async (req, res) => {
    try {
      const bookingsSnap = await bookingsCol.orderBy("createdAt", "desc").get();
      const bookings = await Promise.all(bookingsSnap.docs.map(async doc => {
        const b = doc.data() as Booking;
        const pDoc = await plumbersCol.doc(b.plumberId).get();
        const pData = pDoc.data() as Plumber;
        return { ...b, id: doc.id, plumberId: { businessName: pData?.businessName || "Unknown" } };
      }));
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/plumbers/:id", authenticateAdmin, async (req, res) => {
    try {
      const { plan, status, smsLimit } = req.body;
      const plumberRef = plumbersCol.doc(req.params.id);
      await plumberRef.update({ plan, status, smsLimit });
      const updatedPlumber = (await plumberRef.get()).data() as Plumber;
      delete updatedPlumber.password;
      res.json({ ...updatedPlumber, id: plumberRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/analytics", authenticateAdmin, async (req, res) => {
    try {
      const plumbersSnap = await plumbersCol.get();
      const plumbers = plumbersSnap.docs.map(doc => doc.data() as Plumber);
      const bookingsSnap = await bookingsCol.get();
      const bookings = bookingsSnap.docs.map(doc => doc.data() as Booking);

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

  // AI Booking Parse Endpoint
  app.post("/api/ai-booking-parse", authenticateToken, async (req: any, res) => {
    const { raw_input } = req.body;

    if (!raw_input || typeof raw_input !== "string" || raw_input.trim().length === 0) {
      return res.status(400).json({ error: "raw_input is required" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const todayFormatted = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

      const systemPrompt = `You are a booking assistant for a UK plumbing and heating business. Extract booking details from the plumber's natural language input.

Today's date is ${todayFormatted} (${todayStr}).

Always extract and return ONLY valid JSON with exactly these fields (no markdown, no explanation, just the JSON object):
{
  "customer_name": string | null,
  "customer_phone": string | null,
  "customer_email": string | null,
  "service_name": string | null,
  "scheduled_date": string | null,
  "scheduled_time": string | null,
  "duration_minutes": number | null,
  "address": string | null,
  "notes": string | null,
  "urgency": "emergency" | "urgent" | "normal" | null,
  "price": number | null,
  "payment_status": "paid" | "unpaid" | "deposit" | null,
  "confidence": "high" | "medium" | "low",
  "missing_fields": string[],
  "clarification_needed": string | null
}

Rules for date parsing (relative to today ${todayFormatted}):
- "tomorrow" → tomorrow's date in ISO format YYYY-MM-DD
- "today" / "now" / "ASAP" / "emergency" → today's date
- "next Tuesday" → the next Tuesday after today
- "this Friday" → this coming Friday
- "Monday morning" → next Monday, set time to 09:00
- "afternoon" → 14:00 default time
- "evening" → 18:00 default time
- "end of the week" → this Friday
- "in 2 weeks" → today + 14 days
- Always output scheduled_date as YYYY-MM-DD format
- Always output scheduled_time as HH:MM 24h format

Rules for services (map to common UK plumbing services):
- "boiler" / "boiler repair" / "boiler fault" → "Boiler Repair"
- "boiler service" / "annual service" / "gas service" → "Boiler Service"
- "leaking tap" / "dripping tap" → "Leaking Tap Repair"
- "burst pipe" / "burst" → "Burst Pipe Emergency"
- "gas cert" / "gas certificate" / "CP12" / "landlord cert" → "Gas Safety Certificate"
- "powerflush" / "power flush" → "Powerflush"
- "radiator" → "Radiator Repair/Replacement"
- "shower" / "shower repair" → "Shower Repair"
- "tap" / "tap fitting" → "Tap Fitting"
- "no hot water" → "No Hot Water"
- "no heating" / "heating not working" → "No Heating"
- "emergency callout" / "callout" → "Emergency Callout"
- "drain" / "blocked drain" → "Blocked Drain"
- If no clear match, use the description as-is

Rules for urgency:
- emergency, urgent, ASAP, burst pipe, flood, gas leak, no hot water, no heating → "emergency"
- urgent, soon → "urgent"
- default → "normal"

Rules for price:
- "paid £150" / "already paid £150 cash" → price: 150, payment_status: "paid"
- "charge him £200" / "quote £200" → price: 200, payment_status: "unpaid"
- "£80 deposit" → price: 80, payment_status: "deposit"
- Extract numeric value only (no currency symbol)

Return missing_fields as an array of field names that are important but not mentioned (from: customer_name, customer_phone, address, service_name, scheduled_date).
Return clarification_needed as a single question to ask if critical info is missing, otherwise null.`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: raw_input }],
      });

      const responseText = message.content[0].type === "text" ? message.content[0].text : "";

      // Parse JSON — strip any accidental markdown fences
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(422).json({ error: "Could not parse AI response", raw: responseText });
      }

      const parsed = JSON.parse(jsonMatch[0]);
      res.json(parsed);
    } catch (error: any) {
      console.error("AI booking parse error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create Booking via AI Assistant (authenticated plumber)
  app.post("/api/bookings/ai", authenticateToken, async (req: any, res) => {
    const {
      customerName, phone, address, jobType, description,
      date, scheduledTime, durationMinutes,
      urgency, price, paymentStatus,
      customerEmail, source, ai_raw_input,
    } = req.body;

    try {
      const plumberDoc = await plumbersCol.doc(req.user.id).get();
      if (!plumberDoc.exists) return res.status(404).json({ error: "Plumber not found" });
      const plumber = plumberDoc.data() as Plumber;

      const booking: Booking & Record<string, any> = {
        plumberId: req.user.id,
        customerName: customerName || "Unknown",
        phone: phone || "",
        address: address || "",
        jobType: jobType || "General Job",
        description: description || "",
        date: date ? new Date(date).toISOString() : null,
        scheduled_time: scheduledTime || null,
        duration_minutes: durationMinutes || null,
        urgency: urgency || "normal",
        price: price || null,
        payment_status: paymentStatus || null,
        customer_email: customerEmail || null,
        status: (customerName && phone && address) ? "confirmed" : "pending",
        viewedBySupplier: true,
        backupSmsSent: false,
        source: source || "ai_assistant",
        ai_raw_input: ai_raw_input || null,
        createdAt: new Date().toISOString(),
      };

      const docRef = await bookingsCol.add(booking);
      const bookingId = docRef.id;

      // Create notification
      const notification: Notification = {
        plumberId: req.user.id,
        title: "Booking Added via AI",
        message: `${booking.customerName} — ${booking.jobType} added via AI Assistant.`,
        type: "booking",
        read: false,
        createdAt: new Date().toISOString(),
      };
      await notificationsCol.add(notification);

      res.status(201).json({ ...booking, id: bookingId });
    } catch (error: any) {
      console.error("AI booking creation error:", error);
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
      const plumberDoc = await plumbersCol.doc(req.user.id).get();
      if (!plumberDoc.exists) return res.status(404).json({ error: "Plumber not found" });
      const plumber = plumberDoc.data() as Plumber;

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
          plumberId: plumberDoc.id,
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
      const todayStr = today.toISOString();

      const plumbersTodaySnap = await plumbersCol.where("createdAt", ">=", todayStr).get();
      const bookingsTodaySnap = await bookingsCol.where("createdAt", ">=", todayStr).get();
      const allPlumbersSnap = await plumbersCol.get();
      
      const plumbersToday = plumbersTodaySnap.size;
      const bookingsToday = bookingsTodaySnap.size;
      const totalSmsUsage = allPlumbersSnap.docs.reduce((acc, doc) => acc + ((doc.data() as Plumber).smsUsage || 0), 0);

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
  setInterval(() => {
    sendDailySummary();
  }, 24 * 60 * 60 * 1000);

  // Backup SMS Reminder System (Run every minute)
  const checkBackupSMS = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

      const pendingBookingsSnap = await bookingsCol
        .where("viewedBySupplier", "==", false)
        .where("backupSmsSent", "==", false)
        .where("status", "==", "pending")
        .where("createdAt", ">=", fiveMinutesAgo)
        .where("createdAt", "<=", twoMinutesAgo)
        .get();

      for (const doc of pendingBookingsSnap.docs) {
        const booking = doc.data() as Booking;
        const bookingId = doc.id;
        
        const plumberDoc = await plumbersCol.doc(booking.plumberId).get();
        if (!plumberDoc.exists) continue;
        const plumber = plumberDoc.data() as Plumber;
        const plumberId = plumberDoc.id;

        if (!["pro", "premium"].includes(plumber.plan)) continue;

        // Check SMS limits
        const smsLimit = plumber.smsLimit || (plumber.plan === "premium" ? 500 : (plumber.plan === "pro" ? 100 : 0));
        if (plumber.smsUsage >= smsLimit) continue;

        // Send Backup SMS
        try {
          if (plumber.phone) {
            await sendSMS(
              plumber.phone,
              `Reminder: You have a new job on PlumbFlow. Please check your dashboard.`
            );

            // Update booking and plumber usage
            await bookingsCol.doc(bookingId).update({ backupSmsSent: true });
            await plumbersCol.doc(plumberId).update({ smsUsage: admin.firestore.FieldValue.increment(1) });

            // Create notification for plumber
            const notification: Notification = {
              plumberId,
              title: "Backup SMS Reminder Sent",
              message: `A secondary SMS reminder was sent for the booking from ${booking.customerName}.`,
              type: "system",
              read: false,
              createdAt: new Date().toISOString(),
            };
            await notificationsCol.add(notification);

            console.log(`Backup SMS sent for booking ${bookingId} to ${plumber.businessName}`);
          }
        } catch (err) {
          console.error(`Failed to send backup SMS for booking ${bookingId}:`, err);
        }
      }
    } catch (err) {
      console.error("Error in backup SMS check:", err);
    }
  };

  // Run backup SMS check every minute
  setInterval(() => {
    checkBackupSMS();
  }, 60 * 1000);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
