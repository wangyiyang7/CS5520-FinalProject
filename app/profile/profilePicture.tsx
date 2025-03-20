import React, { useState } from "react";
import { View, Button, StyleSheet, Modal } from "react-native";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageManager from "@/components/ImageManager";

interface ProfilePictureModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (imageURI: string) => void;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [imageURI, setImageURI] = useState<string | null>(null);

  const imageUriHandler = (uri: string) => {
    setImageURI(uri);
  };

  const uploadImage = async () => {
    if (!imageURI) return;

    const response = await fetch(imageURI);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `profilePictures/${Date.now()}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    if (downloadURL) {
      onConfirm(downloadURL);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <ImageManager imageUriHandler={imageUriHandler} />
        {imageURI && <Button title="Upload Image" onPress={uploadImage} />}
        <Button title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
};

export default ProfilePictureModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
