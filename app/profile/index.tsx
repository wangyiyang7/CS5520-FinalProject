import { AuthContext } from "@/components/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/Firebase/services/UserService";
import { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Platform, View, Text, Button } from "react-native";
import EditUsernameModal from "@/components/EditUsernameModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import NotificationSettingsModal from "@/components/NotificationSettingsModal";

export default function ProfileScreen() {
  const { currentUser } = useContext(AuthContext);

  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isNotificationSettingsVisible, setIsNotificationSettingsVisible] =
    useState(false);

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

  const handleEditUsername = () => {
    setIsModalVisible(true);
  };

  const handleConfirmUsername = async (newUsername: string) => {
    if (currentUser?.uid && userInfo) {
      const success = await updateUserProfile(currentUser.uid, {
        username: newUsername,
      });
      if (success) {
        setUserInfo({ ...userInfo, username: newUsername });
      }
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEditProfilePicture = () => {};
  const handleChangePassword = () => {
    setIsChangePasswordVisible(true);
  };
  const handleCancelChangePassword = () => {
    setIsChangePasswordVisible(false);
  };

  const handleNotificationSettings = () => {
    setIsNotificationSettingsVisible(true);
  };

  const handleCancelNotificationSettings = () => {
    setIsNotificationSettingsVisible(false);
  };
  return (
    <View style={styles.container}>
      {currentUser && userInfo && (
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: userInfo.photoURL
                ? userInfo.photoURL
                : Image.resolveAssetSource(
                    require("@/assets/images/profile.jpg")
                  ).uri,
            }}
            style={styles.profileImage}
          />
          <View style={styles.textContainer}>
            <Text style={styles.username}>{userInfo.username}</Text>
            <Text style={styles.email}>Email: {userInfo.email}</Text>
            <Text style={styles.createdAt}>
              Member since: {userInfo.createdAt.toDate().toLocaleString()}
            </Text>
            <Text style={styles.lastLogin}>
              Last Login: {userInfo.lastLogin[0].toDate().toLocaleString()}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Edit Username" onPress={handleEditUsername} />
        </View>
        <View style={styles.button}>
          <Button
            title="Edit Profile Picture"
            onPress={handleEditProfilePicture}
          />
        </View>
        <View style={styles.button}>
          <Button title="Change Password" onPress={handleChangePassword} />
        </View>
        <View style={styles.button}>
          <Button
            title="Notification Settings"
            onPress={handleNotificationSettings}
          />
        </View>
      </View>
      {userInfo && (
        <EditUsernameModal
          visible={isModalVisible}
          currentUsername={userInfo.username}
          onCancel={handleCancel}
          onConfirm={handleConfirmUsername}
        />
      )}
      {userInfo && (
        <ChangePasswordModal
          visible={isChangePasswordVisible}
          email={userInfo.email}
          onCancel={handleCancelChangePassword}
        />
      )}
      <NotificationSettingsModal
        visible={isNotificationSettingsVisible}
        onCancel={handleCancelNotificationSettings}
      />
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
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  textContainer: {
    alignItems: "flex-start",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  createdAt: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  lastLogin: {
    fontSize: 16,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    width: "80%",
    marginBottom: 10,
  },
});
