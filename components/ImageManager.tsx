import {
  StyleSheet,
  View,
  Image,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome for the icon
import {
  launchCameraAsync,
  requestCameraPermissionsAsync,
  useCameraPermissions,
} from "expo-image-picker";

const ImageManager = (prop: { imageUriHandler: (uri: string) => void }) => {
  const [permissionResponse, requestPermission] = useCameraPermissions();
  const [imageURI, setImageURI] = useState("");

  const verifyPermission = async () => {
    if (permissionResponse?.granted) return true;
    try {
      const afterRequest = await requestCameraPermissionsAsync();
      return afterRequest?.granted;
    } catch (err) {
      console.error("Permission request failed:", err);
      return false;
    }
  };

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermission();
    if (!hasPermission) {
      Alert.alert("You need to give permission to access the camera!");
      return;
    }

    try {
      const result = await launchCameraAsync({
        allowsEditing: true,
        quality: 0,
      });
      if (result?.assets) {
        const uri = result.assets[0].uri;
        setImageURI(uri);
        prop.imageUriHandler(uri);
      }
    } catch (err) {
      console.error("Image capture failed:", err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={takeImageHandler}>
        <FontAwesome name="camera" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>Take a Photo</Text>
      </TouchableOpacity>
      {imageURI && <Image source={{ uri: imageURI }} style={styles.image} />}
    </View>
  );
};

export default ImageManager;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#0a7ea4", // Consistent blue color
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    flexDirection: "column", // Stack icon and text vertically
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 8, // Add spacing between the icon and text
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4E9F0",
  },
});
