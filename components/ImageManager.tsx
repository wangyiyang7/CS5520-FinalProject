import { Button, StyleSheet, View, Image, Alert } from "react-native";
import React, { useState } from "react";
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
      Alert.alert("You need to give permission to access camera!");
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
    <View>
      <Button title="Take a photo" onPress={takeImageHandler} />
      {imageURI && <Image source={{ uri: imageURI }} style={styles.image} />}
    </View>
  );
};

export default ImageManager;

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    marginVertical: 5,
  },
});
