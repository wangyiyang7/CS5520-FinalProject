import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function Layout() {

  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#f4511e" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },

        // headerShown: true,
        // headerBackTitle: "Back",
        // // Make sure iOS shows the back button properly
        // headerBackVisible: true

      }}
    >
      <Stack.Screen


        name="login"
        // options={{ title: "Login" }} 
        options={{
          title: "Login",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen

        name="signup"
        // options={{ title: "Sign Up" }} 

        options={{
          title: "Sign Up",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}

      />
    </Stack>
  );
}
