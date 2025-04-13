import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "@/components/AuthContext";
import { useContext } from "react";

export default function Profile() {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  const handlePress = () => {
    // router.push("/profile");

    if (currentUser) {
      router.push("/profile");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <TouchableOpacity style={{ marginRight: 15 }} onPress={handlePress}>
      <Ionicons name="person-circle-outline" size={24} color="black" />
    </TouchableOpacity>
  );
}
