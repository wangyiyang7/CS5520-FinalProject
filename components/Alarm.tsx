import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

export default function Alarm() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmMessage, setAlarmMessage] = useState("");

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await Notifications.requestPermissionsAsync();
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      } catch (e) {}

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };

    setupNotifications();

    // Optional: Cleanup function
    return () => {
      // Cancel all notifications when component unmounts
      Notifications.cancelAllScheduledNotificationsAsync();
    };
  }, []);

  const openModal = () => {
    setModalVisible(true);
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
        updatedDate.setHours(time.getHours());
        updatedDate.setMinutes(time.getMinutes());
        updatedDate.setSeconds(0);
      } else {
        updatedDate.setHours(time.getHours());
        updatedDate.setMinutes(time.getMinutes());
        updatedDate.setSeconds(0);
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

  const setNotification = async () => {
    closeModal();
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();
      if (selectedDate.getTime() - now.getTime() > 0) {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Notification",
            body: alarmMessage || "It's time!",
            sound: true,
          },
          trigger: {
            type: SchedulableTriggerInputTypes.DATE,
            date: selectedDate.getTime(),
          },
        });
        console.log(
          "Notification sets off at Unix epoch time:",
          selectedDate.getTime()
        );
      } else {
        alert("Please select a future date and time");
      }
    } catch (e) {}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Set Notification</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter notification message"
              value={alarmMessage}
              onChangeText={setAlarmMessage}
              multiline
            />

            {Platform.OS === "android" ? (
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
                onPress={setNotification}
              >
                <Text style={styles.buttonText}>Set</Text>
              </TouchableOpacity>
            </View>
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
  iOSPicker: {
    width: 300,
    height: 200,
  },
  input: {
    height: 80,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
    textAlignVertical: "top",
  },
});
