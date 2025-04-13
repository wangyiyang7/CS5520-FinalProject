import { AuthContext } from "@/components/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/Firebase/services/UserService";
import { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome for icons
import EditUsernameModal from "@/components/EditUsernameModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import NotificationSettingsModal from "@/components/NotificationSettingsModal";
import { useRouter } from "expo-router";
import ProfilePictureModal from "./profilePicture";

export default function ProfileScreen() {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isNotificationSettingsVisible, setIsNotificationSettingsVisible] =
    useState(false);
  const [isProfilePictureVisible, setIsProfilePictureVisible] = useState(false);

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

  const handleEditProfilePicture = () => {
    setIsProfilePictureVisible(true);
  };

  const handleCloseProfilePicture = () => {
    setIsProfilePictureVisible(false);
  };

  const handleConfirmProfilePicture = async (downloadURL: string) => {
    if (currentUser?.uid && userInfo) {
      const success = await updateUserProfile(currentUser.uid, {
        photoURL: downloadURL,
      });
      if (success) {
        setUserInfo({ ...userInfo, photoURL: downloadURL });
      }
    }
    setIsProfilePictureVisible(false);
  };

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

  const handleConfirmNotificationSettings = async (settings: {
    categories: string[];
    radius: number;
  }) => {
    if (currentUser?.uid) {
      const success = await updateUserProfile(currentUser.uid, {
        notificationPreferences: settings,
      });
      if (success && userInfo) {
        setUserInfo({
          ...userInfo,
          notificationPreferences: settings,
        });
      }
    }
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
            <Text style={styles.username}>
              {userInfo?.username || "Username not set"}
            </Text>
            <Text style={styles.email}>
              Email: {userInfo?.email || "Email not available"}
            </Text>
            <Text style={styles.createdAt}>
              Member since:{" "}
              {userInfo?.createdAt &&
              typeof userInfo.createdAt.toDate === "function"
                ? userInfo.createdAt.toDate().toLocaleString()
                : "Date not available"}
            </Text>
            <Text style={styles.lastLogin}>
              Last Login:{" "}
              {userInfo?.lastLogin &&
              Array.isArray(userInfo.lastLogin) &&
              userInfo.lastLogin.length > 0 &&
              typeof userInfo.lastLogin[0].toDate === "function"
                ? userInfo.lastLogin[0].toDate().toLocaleString()
                : "Login date not available"}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEditUsername}>
          <FontAwesome name="user" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Edit Username</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleEditProfilePicture}
        >
          <FontAwesome name="camera" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Edit Profile Picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <FontAwesome name="lock" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNotificationSettings}
        >
          <FontAwesome name="bell" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Notification Settings</Text>
        </TouchableOpacity>
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
      {userInfo && (
        <NotificationSettingsModal
          visible={isNotificationSettingsVisible}
          onCancel={handleCancelNotificationSettings}
          onConfirm={handleConfirmNotificationSettings}
          initialCategories={userInfo.notificationPreferences.categories}
          initialRadius={userInfo.notificationPreferences.radius}
        />
      )}
      {userInfo && (
        <ProfilePictureModal
          visible={isProfilePictureVisible}
          onClose={handleCloseProfilePicture}
          onConfirm={handleConfirmProfilePicture}
        />
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
    backgroundColor: "#FFFFFF",
  },
  profileContainer: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 50,
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
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a7ea4",
    padding: 16,
    borderRadius: 25,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 10,
  },
});
