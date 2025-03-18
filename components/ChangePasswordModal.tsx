import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

interface ChangePasswordModalProps {
  visible: boolean;
  email: string;
  onCancel: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  email,
  onCancel,
}) => {
  const handleSendResetEmail = async () => {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset email sent, check your email.");
    } catch (error) {
      alert("Error sending reset email!");
    }
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Change Password</Text>
          <Text>Reset email will be sent to: {email}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onCancel} />
            <Button title="Yes, please send!" onPress={handleSendResetEmail} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
});

export default ChangePasswordModal;
