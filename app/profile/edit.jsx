import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

export default function EditProfile({ user, onSave, onCancel }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [contactNumber, setContactNumber] = useState(user.contactNumber);
  const [idNumber, setIdNumber] = useState(user.idNumber);

  const handleSave = () => {
    if (!firstName || !lastName || !contactNumber || !idNumber) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    onSave({ firstName, lastName, contactNumber, idNumber });
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
           className="bg-secondary mt-6 p-3 rounded-[5px]"
        >
          <Text className="text-white text-center text-xl font-bold">Save Changes</Text>
        </TouchableOpacity>
     
      </ScrollView>
    </SafeAreaView>
  );
}