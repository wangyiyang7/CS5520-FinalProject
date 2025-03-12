import { Image, StyleSheet, Platform, View, Text } from "react-native";
import { AuthContext } from "@/components/AuthContext";
import { useContext } from "react";
import { useRouter } from "expo-router";

export default function Post() {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) {
    router.push("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Screen</Text>
      <Text style={styles.subtitle}>
        Protected content available to logged in users
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
