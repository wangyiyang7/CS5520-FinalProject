import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
// import { useAuth } from "../../context/AuthContext";

export default function ProfileLayout() {
  // const { isLoggedIn } = useAuth();
  const router = useRouter();
  /*
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth-redirect?target=/profile");
    }
  }, [isLoggedIn]);
*/
  return (
    <Stack
      screenOptions={{
        headerTitle: "Profile",
        headerBackTitle: "Back",
      }}
    />
  );
}
