import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const router = useRouter();

  // Sample data; in a real app, fetch this data from your backend
  const [firstName, setFirstName] = useState("Mohammed");
  const [lastName, setLastName] = useState("Ali");
  const [contactNumber, setContactNumber] = useState("0771234567");
  const [idNumber, setIdNumber] = useState("123456789V");

  const handleSave = () => {
    // Validate and update profile; call API if needed.
    if (!firstName || !lastName || !contactNumber || !idNumber) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    Alert.alert("Profile Updated", "Your profile has been successfully updated.");
    router.back(); // Navigate back to Profile Screen
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-3xl font-bold text-secondary mb-6 text-center">Edit Profile</Text>
        <View className="mb-4">
          <Text className="text-lg text-gray-700 mb-1">First Name</Text>
          <TextInput 
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            className="border border-gray-300 rounded p-3"
          />
        </View>
        <View className="mb-4">
          <Text className="text-lg text-gray-700 mb-1">Last Name</Text>
          <TextInput 
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            className="border border-gray-300 rounded p-3"
          />
        </View>
        <View className="mb-4">
          <Text className="text-lg text-gray-700 mb-1">Contact Number</Text>
          <TextInput 
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="Enter contact number"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded p-3"
          />
        </View>
        <View className="mb-4">
          <Text className="text-lg text-gray-700 mb-1">ID Number</Text>
          <TextInput 
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Enter ID number"
            className="border border-gray-300 rounded p-3"
          />
        </View>
        <TouchableOpacity 
          onPress={handleSave}
          className="bg-secondary p-4 rounded-lg mt-6"
        >
          <Text className="text-white text-center text-xl font-bold">Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
