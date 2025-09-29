// components/permissions.ts

// Define roles exactly as they are returned from backend
export type Role = "county user" | "subcounty user" | "nurse" | "admin";

export type ScreenName =
  | "home"
  | "register"
  | "users"
  | "editstaff"
  | "patient_registration";

// Define the permission rules interface
export interface PermissionRule {
  roles: Role[];
}

// Map screens to the roles that can access them
export const permissionRules: Record<ScreenName, PermissionRule> = {
  home: {
    roles: ["county user", "subcounty user", "nurse", "admin"],
  },
  register: {
    roles: ["county user", "subcounty user", "admin"],
  },
  users: {
    roles: ["county user", "subcounty user", "admin"], //
  },
  editstaff: {
    roles: ["county user", "subcounty user", "admin"],
  },
  
  patient_registration: {
    roles: ["county user", "subcounty user", "nurse", "admin"],
  },
};
