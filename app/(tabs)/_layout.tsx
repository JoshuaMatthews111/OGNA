import React from "react";
import { Tabs } from "expo-router";
import { Home, Globe, UserCircle, Users } from "lucide-react-native";
import { useTheme } from "@/store/themeStore";

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.subtext,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ color }) => <Globe size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          headerShown: false,
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sermons"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}