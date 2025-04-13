/**
 * Post creation screen that allows authenticated users to create new community posts.
 * Includes form fields for title, content, category selection, location capture, and photo upload.
 */

import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { AuthContext } from "@/components/AuthContext";
import { useRouter } from "expo-router";
import { createPost } from "@/Firebase/services/PostService";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ImageManipulator } from "expo-image-manipulator";

import { getUserProfile } from "@/Firebase/services/UserService";
import { Ionicons } from "@expo/vector-icons";
import { classifyText } from "@/components/Classification";

import { useClassification } from '@/hooks/useClassification';
import { usePushNotifications } from "@/hooks/usePushNotifications";


export default function PostScreen() {

  // Register for push notifications.
  usePushNotifications();


  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // const [category, setCategory] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationName, setLocationName] = useState("Unknown location");
  const [loading, setLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();


  // const { category, isClassifying, error, classify } = useClassification();
  const { category, isClassifying, error, handleTextChange } = useClassification(true);


  // Check if user is logged in
  useEffect(() => {
    if (currentUser) {
      // console.log("User is logged in", currentUser);

      // Request location permissions when component mounts
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is needed to create posts."
          );
          return;
        }

        try {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);

          // Get location name
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });

          if (reverseGeocode.length > 0) {
            const address = reverseGeocode[0];
            const locationString = [
              address.street,
              address.city,
              address.region,
            ]
              .filter(Boolean)
              .join(", ");

            setLocationName(locationString || "Unknown location");
          }
        } catch (error) {
          console.error("Error getting location:", error);
          Alert.alert("Location Error", "Failed to get your current location.");
        }
      })();
    }
  }, [currentUser]);

  // Handle taking a photo
  const takePhoto = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert(
          "Permission Denied",
          "Camera permission is needed to take photos."
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Camera Error", "Failed to take photo.");
    }
  };

  // Function to upload image to Firebase Storage, Currently not being used because of storage billing issues.
  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const filename = `posts/${Date.now()}-${currentUser?.uid}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  // Handle post submission
  const handleSubmit_ = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to create a post.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your post.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please enter content for your post.");
      return;
    }

    if (!location) {
      Alert.alert("Error", "Location is required for creating a post.");
      return;
    }

    setLoading(true);

    try {
      // Upload image to Firebase Storage
      let photoURL = undefined;

      if (imageUri) {
        photoURL = await uploadImage(imageUri);
      }

      const userProfile = await getUserProfile(currentUser.uid);

      const postData = {
        title,
        content,
        category,
        locationName,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        authorId: currentUser.uid,
        authorName:
          currentUser?.displayName || userProfile?.username || "Anonymous",
        photoURL, //: "", // Placeholder image
        isPublic: true,
      };

      const postId = await createPost(postData);

      if (postId) {
        Alert.alert("Success", "Your post has been created successfully!", [
          {
            text: "View Post",
            onPress: () =>
              router.push({
                pathname: "/post/[id]",
                params: { id: postId },
              }),
          },
          {
            text: "Back to Home",
            // onPress: () => router.push("/(tabs)")
            onPress: () => router.replace("/(tabs)"),
          },
        ]);

        // Reset form
        setTitle("");
        setContent("");
        // setCategory("");
        setImageUri(null);
      } else {
        Alert.alert("Error", "Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "An error occurred while creating your post.");
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to create a post.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your post.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please enter content for your post.");
      return;
    }

    if (!location) {
      Alert.alert("Error", "Location is required for creating a post.");
      return;
    }

    setLoading(true);

    try {
      const userProfile = await getUserProfile(currentUser.uid);

      const postData = {
        title,
        content,
        category,
        locationName,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        authorId: currentUser.uid,
        authorName:
          currentUser?.displayName || userProfile?.username || "Anonymous",
        isPublic: true,
        photoURL: "",
      };

      // Only add photoURL if we have an image
      if (imageUri) {
        const photoURL = await uploadImage(imageUri);
        postData.photoURL = photoURL;
      }


      const postId = await createPost(postData);

      if (postId) {
        Alert.alert("Success", "Your post has been created successfully!", [
          {
            text: "View Post",
            onPress: () =>
              router.push({
                pathname: "/post/[id]",
                params: { id: postId },
              }),
          },
          {
            text: "Back to Home",
            // onPress: () => router.push("/(tabs)")
            onPress: () => router.replace("/(tabs)"),
          },
        ]);

        // Reset form
        setTitle("");
        setContent("");
        // setCategory("");
        setImageUri(null);
      } else {
        Alert.alert("Error", "Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "An error occurred while creating your post.");
    } finally {
      setLoading(false);
    }
  };





  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Creating your post...</Text>
      </View>
    );
  }

  const handleClassify = async () => {
    const result = await classifyText(content);
    // setCategory(result);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.title}>Create a New Post</ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Title</ThemedText>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title for your post"
              maxLength={100}
            />
          </View>

          {/* <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="General" value="General" />
                <Picker.Item label="Traffic" value="Traffic" />
                <Picker.Item label="Safety" value="Safety" />
                <Picker.Item label="Event" value="Event" />
                <Picker.Item label="Infrastructure" value="Infrastructure" />
              </Picker>
            </View>
          </View> */}

          {/*
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <View style={styles.pickerContainer}>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={styles.iosPicker}
                  onPress={() => {
                    // On iOS, we'll use ActionSheetIOS instead
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        options: ['Cancel', 'General', 'Traffic', 'Safety', 'Event', 'Infrastructure'],
                        cancelButtonIndex: 0,
                        title: 'Select Category'
                      },
                      (buttonIndex) => {
                        if (buttonIndex === 0) {
                          // Cancel was tapped
                          return;
                        }
                        // Map the button index to your category values (offset by 1 because of Cancel)
                        const categories = ['General', 'Traffic', 'Safety', 'Event', 'Infrastructure'];
                        setCategory(categories[buttonIndex - 1]);
                      }
                    );
                  }}
                >
                  <ThemedText style={styles.pickerText}>{category}</ThemedText>
                  <Ionicons name="chevron-down" size={20} color="#777" />
                </TouchableOpacity>
              ) : (
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue) => setCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="General" value="General" />
                  <Picker.Item label="Traffic" value="Traffic" />
                  <Picker.Item label="Safety" value="Safety" />
                  <Picker.Item label="Event" value="Event" />
                  <Picker.Item label="Infrastructure" value="Infrastructure" />
                </Picker>
              )}
            </View>
          </View>

*/}

          {/* <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Content</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Describe what's happening..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View> */}


          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Content</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={(text) => {
                setContent(text);
                handleTextChange(text);
              }}
              placeholder="Describe what's happening..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>








          <View>
            {/* <Button title="AI POWER!" onPress={handleClassify} /> */}




            {/* <Button
              title={isClassifying ? "Classifying..." : "Classify Text"}
              onPress={() => classify(content)}
              disabled={isClassifying || content.length < 20}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            {category && (
              <Text style={styles.categoryText}>
                Detected Category: {category}
              </Text>
            )} */}


            {isClassifying ? (
              <View style={styles.classificationStatus}>
                <ActivityIndicator size="small" color={Colors.light.tint} />
                <ThemedText style={styles.classifyingText}>Analyzing content...</ThemedText>
              </View>
            ) : (
              content.length >= 20 && category ? (
                <ThemedText style={[styles.formGroup, styles.categoryText]}>
                  Category: {category}
                </ThemedText>
              ) : content.length > 0 && content.length < 20 ? (
                <ThemedText style={[styles.formGroup, styles.hintText]}>
                  Add {20 - content.length} more characters for automatic classification
                </ThemedText>
              ) : null
            )}


            {/* {category ? (
              <ThemedText style={[styles.formGroup, styles.label]}>
                Category: {category}
              </ThemedText>
            ) : null} */}



          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Location</ThemedText>
            <View style={styles.locationContainer}>
              <ThemedText style={styles.locationText}>
                📍 {locationName}
              </ThemedText>
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Photo</ThemedText>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <ThemedText style={styles.photoButtonText}>
                {imageUri ? "Change Photo" : "Take a Photo"}
              </ThemedText>
            </TouchableOpacity>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            )}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <ThemedText style={styles.submitButtonText}>Post</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 120,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  locationContainer: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 6,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  iosPicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
  },
  pickerText: {
    fontSize: 16,
  },
  // categoryText: {
  //   fontSize: 16,
  //   fontWeight: '500',
  //   color: '#333',
  //   marginTop: 8,
  //   marginBottom: 16,
  //   padding: 8,
  //   backgroundColor: '#f0f0f0',
  //   borderRadius: 6,
  // },


  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 0,
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
    marginBottom: 8,
  },






  classificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  classifyingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },

  hintText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },






});
