import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/Firebase/firebaseSetup";

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
          <Text style={styles.emailText}>
            Reset email will be sent to:{" "}
            <Text style={styles.email}>{email}</Text>
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleSendResetEmail}
            >
              <Text style={styles.buttonText}>Send Email</Text>
            </TouchableOpacity>
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
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 20,
    textAlign: "center",
  },
  email: {
    fontWeight: "bold",
    color: "#0a7ea4",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e0e0e0", // Red for cancel
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#0a7ea4", // Consistent blue for confirm
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ChangePasswordModal;
