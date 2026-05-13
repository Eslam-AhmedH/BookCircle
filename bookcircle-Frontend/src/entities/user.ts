export type UserRole = "Admin" | "Owner" | "Reader";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isApproved: boolean;
}
