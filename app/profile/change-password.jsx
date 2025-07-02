// import React, { useState } from "react";
// import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

// export default function ChangePassword({ onSave, onCancel }) {
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const handleUpdatePassword = () => {
//     if (newPassword !== confirmPassword) {
//       Alert.alert("Error", "New password and confirmation do not match.");
//       return;
//     }
//     if (!oldPassword || !newPassword || !confirmPassword) {
//       Alert.alert("Error", "Please fill in all password fields.");
//       return;
//     }
//     // Implement password update logic, e.g., call API
//     // Example: await api.changePassword({ oldPassword, newPassword });
//     onSave();
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <Text className="text-3xl font-bold text-secondary mb-6 text-center">Change Password</Text>
//         <View className="mb-4">
//           <Text className="text-lg text-gray-700 mb-1">Old Password</Text>
//           <TextInput
//             value={oldPassword}
//             onChangeText={setOldPassword}
//             placeholder="Enter old password"
//             secureTextEntry
//             className="border border-gray-300 rounded p-3"
//           />
//         </View>
//         <View className="mb-4">
//           <Text className="text-lg text-gray-700 mb-1">New Password</Text>
//           <TextInput
//             value={newPassword}
//             onChangeText={setNewPassword}
//             placeholder="Enter new password"
//             secureTextEntry
//             className="border border-gray-300 rounded p-3"
//           />
//         </View>
//         <View className="mb-4">
//           <Text className="text-lg text-gray-700 mb-1">Confirm New Password</Text>
//           <TextInput
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//             placeholder="Confirm new password"
//             secureTextEntry
//             className="border border-gray-300 rounded p-3"
//           />
//         </View>
//         <TouchableOpacity
//           onPress={handleUpdatePassword}
//           className="bg-secondary p-4 rounded-lg mt-6"
//         >
//           <Text className="text-white text-center text-xl font-bold">Update Password</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={onCancel}
//           className="border border-gray-500 p-4 rounded-lg flex-1 mt-4"
//         >
//           <Text className="text-gray-500 text-center font-bold">Cancel</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ChangePassword() {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    // Implement password update logic, e.g., call API
    // Example: await api.changePassword({ oldPassword, newPassword });
    Alert.alert("Success", "Password updated successfully!");
    navigation.goBack(); // Navigate back after saving
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-3xl font-bold text-secondary mb-6 text-center">Change Password</Text>
        <View className="mb-4">
          <Text className="text-lg text-gray-700 mb-1">Old Password</Text>
          <TextInput
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter old password"
            secureTextEntry
            className="border border-gray-300 rounded p-3"
          />
        </View>
        <View className="mb-4">
          <Text className="text-lg text-gray-700 mb-1">New Password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
            className="border border-gray-300 rounded p-3"
          />
        </View>
        <View className="mb-4">
          <Text className="text-lg text-gray-700 mb-1">Confirm New Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            className="border border-gray-300 rounded p-3"
          />
        </View>
        <TouchableOpacity
          onPress={handleUpdatePassword}
          className="bg-secondary p-4 rounded-lg mt-6"
        >
          <Text className="text-white text-center text-xl font-bold">Update Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="border border-gray-500 p-4 rounded-lg flex-1 mt-4"
        >
          <Text className="text-gray-500 text-center font-bold">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}