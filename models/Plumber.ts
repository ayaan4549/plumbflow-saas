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
