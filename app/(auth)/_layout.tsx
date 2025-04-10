import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function Layout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerLeft: () => (
            <TouchableOpacity
              onPressIn={() => router.push("/(tabs)")}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "Sign Up",
          headerLeft: () => (
            <TouchableOpacity
              onPressIn={() => router.push("/login")}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
