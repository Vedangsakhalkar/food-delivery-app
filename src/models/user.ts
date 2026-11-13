export const ROLES = ["customer", "owner", "admin"] as const;
export type Role = (typeof ROLES)[number];

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  createdAt: Date;
}
