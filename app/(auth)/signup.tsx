import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/Firebase/firebaseSetup";
import { createUserProfile } from "@/Firebase/services/UserService";

const isPasswordStrong = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

const getPasswordStrengthMessage = (password: string): string => {
  const checks = {
    length: password.length >= 8,
    upperCase: /[A-Z]/.test(password),
    lowerCase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const missing = [];
  if (!checks.length) missing.push("at least 8 characters");
  if (!checks.upperCase) missing.push("an uppercase letter");
  if (!checks.lowerCase) missing.push("a lowercase letter");
  if (!checks.number) missing.push("a number");
  if (!checks.special) missing.push("a special character");

  return missing.length > 0
    ? `Password must contain ${missing.join(", ")}`
    : "";
};

const signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    setPasswordError("");

    if (!isPasswordStrong(password)) {
      setPasswordError(getPasswordStrengthMessage(password));
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user.uid);
      const newUser = await createUserProfile(user.uid, email, username);
      router.replace("/(tabs)");
    } catch (error) {
      const errorCode = (error as any).code;
      const errorMessage = (error as any).message;
      console.log(errorCode, errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: Image.resolveAssetSource(require("@/assets/images/logo.png"))
            .uri,
        }}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(getPasswordStrengthMessage(text));
        }}
      />
      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};
export default signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    marginBottom: 32,
    textAlign: "center",
    fontWeight: "bold",
    color: "#0a7ea4",
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
  backButton: {
    marginTop: 24,
    alignItems: "center",
  },
  backText: {
    color: "#6C7A89",
    fontSize: 14,
  },
});
