// usePermissions.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { permissionRules, ScreenName } from "../components/permissions";

export const usePermissions = () => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        // Try to get all roles first
        const rolesJson = await AsyncStorage.getItem("roles");
        console.log("usePermissions - Roles JSON from storage:", rolesJson);

        if (rolesJson) {
          const rolesArray = JSON.parse(rolesJson);
          setUserRoles(Array.isArray(rolesArray) ? rolesArray : [rolesArray]);
        } else {
          // Fallback to single role
          const singleRole = await AsyncStorage.getItem("role");
          console.log("usePermissions - Single role from storage:", singleRole);
          setUserRoles(singleRole ? [singleRole] : ["nurse"]);
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
        setUserRoles(["nurse"]);
      }
    };

    loadPermissions();
  }, []);

  // const canAccess = (screen: ScreenName): boolean => {
  //   const rules = permissionRules[screen];
  //   if (!rules) return false;

  //   console.log(`Permission check for ${screen}:`, {
  //     userRoles,
  //     requiredRoles: rules.roles,
  //     hasRequiredRole: userRoles.some((role) =>
  //       rules.roles.includes(role as Role)
  //     ),
  //   });

  //   return userRoles.some((role) => rules.roles.includes(role as Role));
  // };
  const canAccess = (screen: ScreenName): boolean => {
    // Allow access while loading to prevent false denials
    //if (isLoading) return true;

    const rules = permissionRules[screen];
    if (!rules) return false;

    // More flexible matching
    const hasAccess = userRoles.some((userRole) =>
      rules.roles.some(
        (requiredRole) =>
          userRole.toLowerCase().includes(requiredRole.toLowerCase()) ||
          requiredRole.toLowerCase().includes(userRole.toLowerCase())
      )
    );

    return hasAccess;
  };
  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  return { userRoles, canAccess, hasRole };
};
