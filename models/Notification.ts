export interface Notification {
  id?: string;
  plumberId: string;
  title: string;
  message: string;
  type: "booking" | "system" | "payment";
  read: boolean;
  createdAt: string | Date;
}
