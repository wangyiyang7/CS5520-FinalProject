import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export default function Alarm() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmTimeout, setAlarmTimeout] = useState<NodeJS.Timeout | null>(null);

  const openModal = () => {
    setModalVisible(true);
    // Initialize with current date/time
    setSelectedDate(new Date());
    if (Platform.OS === "ios") {
      setShowDatePicker(true);
      setShowTimePicker(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      const currentTime = selectedDate;
      if (Platform.OS === "android") {
        setShowDatePicker(false);
        // Keep the current time when changing date
        date.setHours(currentTime.getHours());
        date.setMinutes(currentTime.getMinutes());
      }
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (time) {
      const updatedDate = new Date(selectedDate);
      if (Platform.OS === "android") {
        setShowTimePicker(false);
        // Keep the current date when changing time
        updatedDate.setHours(time.getHours());
        updatedDate.setMinutes(time.getMinutes());
      } else {
        // For iOS, the date picker returns a full date & time
        updatedDate.setHours(time.getHours());
        updatedDate.setMinutes(time.getMinutes());
      }
      setSelectedDate(updatedDate);
    }
  };

  const showAndroidDatePicker = () => {
    setShowDatePicker(true);
  };

  const showAndroidTimePicker = () => {
    setShowTimePicker(true);
  };

  const setAlarm = () => {
    closeModal();

    // Clear any existing alarm
    if (alarmTimeout) {
      clearTimeout(alarmTimeout);
    }

    const now = new Date();
    const timeUntilAlarm = selectedDate.getTime() - now.getTime();

    // Only set alarm if it's in the future
    if (timeUntilAlarm > 0) {
      setAlarmActive(true);

      // Set up the alarm timeout
      const timeout = setTimeout(() => {
        triggerAlarm();
      }, timeUntilAlarm);

      setAlarmTimeout(timeout);
      /*
      if (onAlarmSet) {
        onAlarmSet(selectedDate);
      }*/
    } else {
      // Handle case where selected time is in the past
      alert("Please select a future date and time");
    }
  };

  const triggerAlarm = () => {
    setAlarmActive(true);
    // Show alarm modal
    setModalVisible(true);
  };

  const dismissAlarm = () => {
    setAlarmActive(false);
    setModalVisible(false);
    /*if (onAlarmDismiss) {
      onAlarmDismiss();
    }*/
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View>
      <TouchableOpacity style={{ marginRight: 15 }} onPress={openModal}>
        <Ionicons name="notifications" size={24} color="black" />
      </TouchableOpacity>

      {alarmActive && (
        <View style={styles.activeAlarmContainer}>
          <Text style={styles.activeAlarmText}>
            Alarm set for: {formatDate(selectedDate)} at{" "}
            {formatTime(selectedDate)}
          </Text>
        </View>
      )}

      {/* Alarm setting modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {alarmActive && (
              // Alarm triggered view
              <View>
                <Text style={styles.alarmTitle}>Alarm!</Text>
                <Text style={styles.alarmText}>
                  It's {formatTime(new Date())}
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.dismissButton]}
                  onPress={dismissAlarm}
                >
                  <Text style={styles.buttonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            )}

            {!alarmActive && (
              // Alarm setting view
              <View>
                <Text style={styles.modalTitle}>Set Alarm</Text>

                {Platform.OS === "android" ? (
                  // Android date/time picker logic
                  <View>
                    <View style={styles.dateTimeDisplay}>
                      <TouchableOpacity onPress={showAndroidDatePicker}>
                        <Text style={styles.dateTimeText}>
                          Date: {formatDate(selectedDate)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={showAndroidTimePicker}>
                        <Text style={styles.dateTimeText}>
                          Time: {formatTime(selectedDate)}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                      />
                    )}

                    {showTimePicker && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                        is24Hour={false}
                      />
                    )}
                  </View>
                ) : (
                  // iOS date/time picker
                  <DateTimePicker
                    value={selectedDate}
                    mode="datetime"
                    display="spinner"
                    onChange={handleDateChange}
                    style={styles.iOSPicker}
                  />
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={closeModal}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.setButton]}
                    onPress={setAlarm}
                  >
                    <Text style={styles.buttonText}>Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  dateTimeDisplay: {
    marginVertical: 10,
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#888",
    flex: 1,
    marginRight: 5,
  },
  setButton: {
    backgroundColor: "#4CAF50",
    flex: 1,
    marginLeft: 5,
  },
  dismissButton: {
    backgroundColor: "#F44336",
    width: "100%",
  },
  iOSPicker: {
    width: 300,
    height: 200,
  },
  activeAlarmContainer: {
    backgroundColor: "#E3F2FD",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  activeAlarmText: {
    color: "#0D47A1",
  },
  alarmTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F44336",
    marginBottom: 10,
  },
  alarmText: {
    fontSize: 18,
    marginBottom: 20,
  },
});
