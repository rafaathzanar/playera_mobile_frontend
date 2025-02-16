import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const SignInScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
   
    router.replace("/home");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-2xl font-bold text-secondary mb-6">Login</Text>

      <TextInput
        className="w-full p-4 border border-secondary text-white rounded-lg mb-4"
        placeholder="Email"
        placeholderTextColor={"gray"}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="w-full p-4 border border-secondary  text-white rounded-lg mb-4"
        placeholder="Password"
        placeholderTextColor={"gray"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleSignIn}
        className="w-full bg-secondary p-4 rounded-lg mb-4"
      >
        <Text className="text-center text-white font-bold">Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("sign-up")}>
        <Text className="text-gray-200">Don't have an account? <Text className="text-~"> Sign Up </Text> </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default SignInScreen;
