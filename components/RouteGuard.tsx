// components/RouteGuard.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { ScreenName } from "../components/permissions";
import { usePermissions } from "../components/usePermissions";

interface RouteGuardProps {
  children: React.ReactNode;
  screen: ScreenName;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, screen }) => {
  const router = useRouter();
  const { userRoles, isLoading, canAccess } = usePermissions();

  useEffect(() => {
    if (!isLoading) {
      if (userRoles.length === 0) {
        router.replace("/login");
        return;
      }

      if (!canAccess(screen)) {
        router.replace("/home");
        return;
      }
    }
  }, [userRoles, isLoading, screen]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (userRoles.length === 0 || !canAccess(screen)) {
    return null;
  }

  return <>{children}</>;
};
