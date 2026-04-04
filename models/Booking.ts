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
