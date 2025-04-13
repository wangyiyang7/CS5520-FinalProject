import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Profile from "@/components/Profile";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "@/components/AuthContext";
import { useContext } from "react";
import Alarm from "@/components/Alarm";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,

        headerShown: true,

        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),

        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Alarm />
            <Profile />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons color={color} size={24} name="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <MaterialIcons color={color} size={24} name="map" />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Create",
          tabBarIcon: ({ color }) => (
            <MaterialIcons color={color} size={24} name="add-circle-outline" />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            if (!currentUser) {
              e.preventDefault();
              router.push("/(auth)/login");
            }
          },
        })}
      />
    </Tabs>
  );
}
