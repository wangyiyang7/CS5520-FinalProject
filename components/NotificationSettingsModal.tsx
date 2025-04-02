import React, { useEffect, useState } from "react";
import { Modal, View, Text, Button, StyleSheet, TextInput } from "react-native";
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
                  color={categories.includes(category) ? "#4630EB" : undefined}
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
              keyboardType="numeric"
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onCancel} />
            <Button
              title="Confirm"
              onPress={() =>
                onConfirm({ categories, radius: parseFloat(radius) })
              }
            />
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
  checkboxContainer: {
    width: "100%",
    marginBottom: 5,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  checkboxLabel: {
    marginLeft: 10, // Add margin between checkbox and label
  },
  description: {
    width: "100%",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  inputLabel: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default NotificationSettingsModal;
