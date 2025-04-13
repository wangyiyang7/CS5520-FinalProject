/**
 * Post edit screen that allows the post author to update their post.
 * Reuses form components from post creation with pre-filled post data.
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
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { AuthContext } from "@/components/AuthContext";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { getPostById, updatePost } from "@/Firebase/services/PostService";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { classifyText } from "@/components/Classification";

import { useClassification } from '@/hooks/useClassification';


export default function EditPostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalPhotoURL, setOriginalPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [post, setPost] = useState<any>(null);

  const { category: detectedCategory, isClassifying, error, handleTextChange } = useClassification(true);


  // Load post data
  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const postId = Array.isArray(id) ? id[0] : id;
        if (!postId) {
          Alert.alert("Error", "Post ID not found");
          router.back();
          return;
        }

        const postData = await getPostById(postId);
        if (!postData) {
          Alert.alert("Error", "Post not found");
          router.back();
          return;
        }

        // Check if current user is the author
        if (currentUser?.uid !== postData.authorId) {
          Alert.alert("Error", "You do not have permission to edit this post");
          router.back();
          return;
        }

        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setCategory(postData.category);
        if (postData.photoURL) {
          setOriginalPhotoURL(postData.photoURL);
        }

        if (postData.category) {
          setCategory(postData.category);
        }



      } catch (err) {
        console.error("Error loading post for editing:", err);
        Alert.alert("Error", "Failed to load post data");
        router.back();
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      loadPost();
    } else {
      // Alert.alert(
      //     "Login Required",
      //     "You need to be logged in to edit posts.",
      //     [{ text: "OK", onPress: () => router.push("/(auth)/login") }]
      // );
    }




  }, [id, currentUser]);

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

  // Function to upload image to Firebase Storage
  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const filename = `posts/${Date.now()}-${currentUser?.uid}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  // Handle post update
  const handleUpdate = async () => {
    if (!currentUser || !post) {
      Alert.alert("Error", "You must be logged in to update a post.");
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

    setPosting(true);

    try {
      let photoURL = originalPhotoURL;

      // Only upload a new image if one was selected
      if (imageUri) {
        photoURL = await uploadImage(imageUri);
      }

      const postData = {
        title,
        content,
        category,
        photoURL: photoURL || "",
      };

      const success = await updatePost(post.id, postData);

      if (success) {
        Alert.alert("Success", "Your post has been updated successfully!", [
          {
            text: "View Post",
            onPress: () =>
              router.push({
                pathname: "/post/[id]",
                params: { id: post.id },
              }),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to update post. Please try again.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      Alert.alert("Error", "An error occurred while updating your post.");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading post data...</Text>
      </View>
    );
  }

  const handleClassify = async () => {
    const result = await classifyText(content);
    setCategory(result);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen options={{ title: "Edit Post" }} />

      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.formContainer}>
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
          {/*
                    <View style={styles.formGroup}>
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

                // Update category when a new one is detected
                if (detectedCategory && text.length >= 20) {
                  setCategory(detectedCategory);
                }
              }}
              placeholder="Describe what's happening..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>




          {isClassifying ? (
            <View style={styles.classificationStatus}>
              <ActivityIndicator size="small" color={Colors.light.tint} />
              <ThemedText style={styles.classifyingText}>Analyzing content...</ThemedText>
            </View>
          ) : (
            category ? (
              <ThemedText style={[styles.formGroup, styles.categoryText]}>
                Category: {category}
              </ThemedText>
            ) : content.length > 0 && content.length < 20 ? (
              <ThemedText style={[styles.formGroup, styles.hintText]}>
                Add {20 - content.length} more characters for automatic classification
              </ThemedText>
            ) : null
          )}


          {/* <View>
            <Button title="AI POWER!" onPress={handleClassify} />
            {category ? (
              <ThemedText style={[styles.formGroup, styles.label]}>
                Category: {category}
              </ThemedText>
            ) : null}
          </View> */}

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Photo</ThemedText>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <ThemedText style={styles.photoButtonText}>
                {imageUri || originalPhotoURL ? "Change Photo" : "Take a Photo"}
              </ThemedText>
            </TouchableOpacity>

            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : originalPhotoURL ? (
              <Image
                source={{ uri: originalPhotoURL }}
                style={styles.previewImage}
              />
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
              disabled={posting}
            >
              <ThemedText style={styles.updateButtonText}>
                {posting ? "Updating..." : "Update Post"}
              </ThemedText>
            </TouchableOpacity>
          </View>
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  updateButton: {
    flex: 2,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginLeft: 8,
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
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
  hintText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },







});
