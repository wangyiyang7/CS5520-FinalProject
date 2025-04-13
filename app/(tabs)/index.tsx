/**
 * Main home screen component accessible to both guest and authenticated users.
 * Integrates the content header and public posts list components.
 */

import { StyleSheet, View } from "react-native";
import { PublicContentHeader } from "@/components/public/PublicContentHeader";
import { PublicPostsList } from "@/components/public/PublicPostsList";
import { setNotificationHandler } from "expo-notifications";

setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* <PublicContentHeader /> */}
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
