/**
 * Main home screen component accessible to both guest and authenticated users.
 * Integrates the content header and public posts list components.
 */

import { StyleSheet, View, Text } from "react-native";
import MyWeather from "@/components/MyWeather";
import { PublicContentHeader } from "@/components/public/PublicContentHeader";
import { PublicPostsList } from "@/components/public/PublicPostsList";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>Public content available to all users</Text> */}
      {/* This has been integrated into the PublicPostsList component Now */}
      {/* <MyWeather /> */}

      <PublicContentHeader />
      <PublicPostsList />
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
