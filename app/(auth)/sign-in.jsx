import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const SignInScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
   
    router.replace("/home");
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <Text className="text-2xl font-bold text-blue-600 mb-6">Sign In</Text>

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

      <TouchableOpacity
        onPress={handleSignIn}
        className="w-full bg-blue-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-center text-white font-bold">Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("sign-up")}>
        <Text className="text-blue-500">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInScreen;
