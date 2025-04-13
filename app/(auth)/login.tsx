import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/Firebase/firebaseSetup";
import { FirebaseError } from "@firebase/util";
import { getDocument, updateDocument } from "@/Firebase/firestoreHelper";
import { Timestamp } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

export default function login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    // Handle login logic here
    console.log("Email:", email);
    console.log("Password:", password);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential) {
        router.push("/(tabs)");
        const userDoc = await getDocument("users", userCredential.user.uid);

        if (userDoc) {
          // Extract the lastLogin array
          const lastLoginArray = userDoc.lastLogin;

          if (lastLoginArray && lastLoginArray.length === 2) {
            // Create a new array with the second element of lastLoginArray as the first element
            // and Timestamp.now() as the second element
            const newArray = [lastLoginArray[1], Timestamp.now()];
            console.log(newArray);
            // Update the user document with the new array
            const success = updateDocument("users", userCredential.user.uid, {
              lastLogin: newArray,
            });
          }
        }
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        setError(error.message);
      }
    }
  };

  const handleSendResetEmail = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset email sent, check your email.");
    } catch (error) {
      alert("Enter Email!");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Log in to</Text>
        <Image
          source={{
            uri: Image.resolveAssetSource(require("@/assets/images/logo.png"))
              .uri,
          }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6C7A89"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6C7A89"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOG IN</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleSendResetEmail}
      >
        <Text style={styles.backText}>Forget Password</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0a7ea4",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  input: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E4E9F0",
    padding: 16,
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 16,
    color: "#2C3E50",
  },
  button: {
    backgroundColor: "#0a7ea4",
    padding: 16,
    borderRadius: 25,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#e0e0e0",
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#0a7ea4",
    fontWeight: "700",
  },
  backButton: {
    marginTop: 24,
    alignItems: "center",
  },
  backText: {
    color: "#6C7A89",
    fontSize: 14,
  },
});
