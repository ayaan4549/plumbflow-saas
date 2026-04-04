export interface SuperAdmin {
  id?: string;
  email: string;
  password?: string;
  name: string;
  role: "super_admin";
  createdAt?: string | Date;
}
