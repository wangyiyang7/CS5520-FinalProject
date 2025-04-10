import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import Checkbox from "expo-checkbox";

interface NotificationSettingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (settings: { categories: string[]; radius: number }) => void;
  initialCategories: string[];
  initialRadius: number;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  initialCategories,
  initialRadius,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [radius, setRadius] = useState<string>("");

  useEffect(() => {
    setCategories(initialCategories);
    setRadius(initialRadius.toString());
  }, [initialCategories, initialRadius]);

  const toggleCategory = (category: string) => {
    setCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Notification Settings</Text>

          <View style={styles.checkboxContainer}>
            <Text style={styles.description}>
              Select categories for push notifications:
            </Text>
            {[
              "Entertainment & Culture",
              "Sports & Activities",
              "News & Incidents",
              "Food & Social",
              "Travel & Environment",
            ].map((category) => (
              <View key={category} style={styles.checkbox}>
                <Checkbox
                  style={styles.checkbox}
                  value={categories.includes(category)}
                  onValueChange={() => toggleCategory(category)}
                  color={categories.includes(category) ? "#0a7ea4" : undefined}
                />
                <Text style={styles.checkboxLabel}>{category}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.description}>
            Receive notifications within (km):
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={radius}
              onChangeText={setRadius}
              placeholder="Enter radius"
              placeholderTextColor="#6C7A89"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() =>
                onConfirm({ categories, radius: parseFloat(radius) })
              }
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
    marginBottom: 20,
  },
  checkboxContainer: {
    width: "100%",
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 10, // Add margin between checkbox and label
    fontSize: 16,
    color: "#2C3E50",
  },
  description: {
    width: "100%",
    marginBottom: 10,
    fontSize: 16,
    color: "#2C3E50",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E4E9F0",
    borderRadius: 8,
    backgroundColor: "#F5F7FA",
    fontSize: 16,
    color: "#2C3E50",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
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

export default NotificationSettingsModal;
