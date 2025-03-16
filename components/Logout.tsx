import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "@/components/AuthContext";
import { useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/Firebase/firebaseSetup";

export default function Logout() {
  const handlePress = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <TouchableOpacity style={{ marginRight: 15 }} onPress={handlePress}>
      <Ionicons name="log-out" size={24} color="black" />
    </TouchableOpacity>
  );
}
