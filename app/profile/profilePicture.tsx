import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal } from "react-native";
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
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Profile Picture</Text>
          <ImageManager imageUriHandler={imageUriHandler} />
          {imageURI && (
            <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProfilePictureModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0a7ea4", // Consistent with profile screen
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#0a7ea4", // Consistent blue for upload
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0", // Red for cancel
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
