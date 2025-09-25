// components/permissions.ts
export type Role = "county_user" | "subcounty_user" | "nurse";
export type ScreenName =
  | "home"
  | "register"
  | "users"
  | "editstaff"
  | "patient_registration";

export const screenPermissions = {
  home: ["county_user", "subcounty_user", "nurse"],
  register: ["county_user", "subcounty_user"],
  users: ["county_user", "subcounty_user"],
  editstaff: ["county_user", "subcounty_user"],
  patient_registration: ["county_user", "subcounty_user", "nurse"],
} as const satisfies Record<ScreenName, Role[]>;
