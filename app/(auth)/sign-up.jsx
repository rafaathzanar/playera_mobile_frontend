import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const SignUpScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    router.push("sign-in");
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <Text className="text-2xl font-bold text-blue-600 mb-6">Sign Up</Text>

      <TextInput
        className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleSignUp}
        className="w-full bg-blue-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-center text-white font-bold">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("sign-in")}>
        <Text className="text-blue-500">Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;
