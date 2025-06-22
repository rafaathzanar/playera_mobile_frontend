import React, { useState } from "react";
import { SafeAreaView, View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState({
    firstName: "Mohammed",
    lastName: "Ali",
    contactNumber: "Contact : 0771234567",
    idNumber: "NIC: 123456789V",
    profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7oMra0QkSp_Z-gShMOcCIiDF5gc_0VKDKDg&s",
  });

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleChangePassword = () => {
    router.push("/profile/change-password");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Implement delete account API call here
            Alert.alert("Account deleted");
            router.replace("/auth/sign-in");
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    // Clear auth tokens and navigate to sign in
    router.replace("/auth/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <View className="items-center">
        <Image
          source={{ uri: user.profilePicture }}
          className="w-24 h-24 rounded-full border-2 border-gray-300"
        />
        <Text className="mt-4 text-2xl font-bold text-gray-800">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-gray-600">{user.contactNumber}</Text>
        <Text className="text-gray-600">{user.idNumber}</Text>
      </View>

      <View className="mt-20 ml-4 mr-4 space-y-4">
        <TouchableOpacity
          onPress={handleEditProfile}
          className="bg-blue-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-bold">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleChangePassword}
          className="bg-indigo-500 p-4 mt-4 rounded-lg"
        >
          <Text className="text-white text-center font-bold">Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDeleteAccount}
          className="bg-red-500 p-4  mt-4 rounded-lg"
        >
          <Text className="text-white text-center font-bold">Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-gray-500 p-4  mt-20 rounded-lg"
        >
          <Text className="text-white text-center font-bold">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
