import { AuthContext } from "@/components/AuthContext";
import { getUserProfile, UserProfile } from "@/Firebase/services/UserService";
import { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Platform, View, Text } from "react-native";

export default function ProfileScreen() {
  const { currentUser } = useContext(AuthContext);

  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          const info = await getUserProfile(currentUser.uid);
          setUserInfo(info);
        } catch (e) {
          console.error("Failed to fetch user profile:", e);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  return (
    <View style={styles.container}>
      {currentUser && (
        <View>
          <Text>{userInfo?.id}</Text>
          <Text>{userInfo?.username}</Text>
          <Text>{userInfo?.email}</Text>
          <Text>{userInfo?.createdAt.toDate().toLocaleDateString()}</Text>
          <Text>{userInfo?.lastLogin[0].toDate().toLocaleString()}</Text>
          <Text>{userInfo?.photoURL}</Text>
        </View>
      )}
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
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
});
