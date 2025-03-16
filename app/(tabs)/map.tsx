
// app/(tabs)/map.tsx
import { View, Text, StyleSheet } from "react-native";

export default function Map() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Screen</Text>
      <Text style={styles.subtitle}>
        Public map content available to all users
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
