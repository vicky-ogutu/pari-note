import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type Role = "county_user" | "subcounty_user" | "nurse";
export type ScreenName =
  | "home"
  | "register"
  | "users"
  | "editstaff"
  | "patient_registration";

export const screenPermissions: Record<ScreenName, readonly Role[]> = {
  home: ["county_user", "subcounty_user", "nurse"],
  register: ["county_user", "subcounty_user"],
  users: ["county_user", "subcounty_user"],
  editstaff: ["county_user", "subcounty_user"],
  patient_registration: ["nurse"],
} as const;
// Updated usePermissions hook
export const usePermissions = () => {
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRoles();
  }, []);

  const loadUserRoles = async () => {
    try {
      // Try to get roles from the new format first
      const rolesString = await AsyncStorage.getItem("roles");

      if (rolesString) {
        // Parse the roles array
        const roles = JSON.parse(rolesString) as Role[];
        setUserRoles(roles);
      } else {
        // Fallback to the old single role format
        const singleRole = (await AsyncStorage.getItem("role")) as Role | null;
        if (singleRole) {
          const rolesArray = [singleRole];
          setUserRoles(rolesArray);
          // Update storage to new format for future use
          await AsyncStorage.setItem("roles", JSON.stringify(rolesArray));
        }
      }
    } catch (error) {
      console.error("Error loading user roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canAccess = (screen: ScreenName): boolean => {
    if (userRoles.length === 0) return false;
    const allowedRoles = screenPermissions[screen];
    return userRoles.some((role) => allowedRoles.includes(role));
  };

  const hasRole = (role: Role): boolean => {
    return userRoles.includes(role);
  };

  return {
    userRoles,
    isLoading,
    canAccess,
    hasRole,
    reloadPermissions: loadUserRoles,
  };
};
