import { Stack } from "expo-router";
import { useContext, useEffect } from "react";
import { useRouter } from "expo-router";
import Logout from "@/components/Logout";
import { AuthContext } from "@/components/AuthContext";

export default function ProfileLayout() {
  // const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/(tabs)");
    }
  }, [currentUser]);

  return (
    <Stack
      screenOptions={{
        headerTitle: "Profile",
        headerBackTitle: "Back",
        headerRight: () => <Logout />,
      }}
    />
  );
}
