export interface Plumber {
  id?: string;
  businessName: string;
  ownerName: string;
  email: string;
  password?: string;
  phone?: string;
  subdomain: string;
  authProvider: "email" | "google";
  serviceAreas: string[];
  plan: "basic" | "pro" | "premium";
  currency: "GBP" | "USD" | "EUR";
  smsEnabled: boolean;
  emailEnabled: boolean;
  smsUsage: number;
  smsLimit: number;
  status: "active" | "inactive";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string | Date;
  uid?: string;
}

export interface Booking {
  id?: string;
  plumberId: string;
  customerName: string;
  phone: string;
  address: string;
  jobType: string;
  description?: string;
  date?: string | Date;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  viewedBySupplier: boolean;
  backupSmsSent: boolean;
  createdAt: string | Date;
}

export interface SuperAdmin {
  id?: string;
  email: string;
  password?: string;
  name: string;
  role: "super_admin";
  createdAt?: string | Date;
}

export interface Notification {
  id?: string;
  plumberId: string;
  title: string;
  message: string;
  type: "booking" | "system" | "payment";
  read: boolean;
  createdAt: string | Date;
}
