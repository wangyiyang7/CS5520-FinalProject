import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface EditUsernameModalProps {
  visible: boolean;
  currentUsername: string;
  onCancel: () => void;
  onConfirm: (newUsername: string) => void;
}

const EditUsernameModal: React.FC<EditUsernameModalProps> = ({
  visible,
  currentUsername,
  onCancel,
  onConfirm,
}) => {
  const [newUsername, setNewUsername] = useState(currentUsername);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Username</Text>
          <Text style={styles.currentUsername}>
            Current Username:{" "}
            <Text style={styles.username}>{currentUsername}</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Enter new username"
            placeholderTextColor="#6C7A89"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => onConfirm(newUsername)}
            >
              <Text style={styles.buttonText}>Confirm</Text>
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
  currentUsername: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 10,
    textAlign: "center",
  },
  username: {
    fontWeight: "bold",
    color: "#0a7ea4",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E4E9F0",
    borderRadius: 8,
    backgroundColor: "#F5F7FA",
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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

export default EditUsernameModal;
