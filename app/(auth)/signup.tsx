import { StyleSheet, Text, View, TextInput, Button } from "react-native";
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
    // Reset error
    setPasswordError("");

    // Check password strength before creating account
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
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button
        title="Back to Login"
        onPress={() => router.replace("/(auth)/login")}
      />
    </View>
  );
};
export default signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
});
