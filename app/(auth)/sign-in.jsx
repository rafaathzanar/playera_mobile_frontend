import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";

const SignInScreen = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Please check your credentials");
    } finally {
      setIsSubmitting(false);
    }
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
        keyboardType="email-address"
        returnKeyType="next"
        style={{ color: 'white' }}
      />
      <TextInput
        className="w-full p-4 border border-secondary  text-white rounded-lg mb-4"
        placeholder="Password"
        placeholderTextColor={"gray"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        returnKeyType="done"
        blurOnSubmit={true}
        style={{ color: 'white' }}
      />

      <TouchableOpacity
        onPress={handleSignIn}
        disabled={isSubmitting || isLoading}
        className={`w-full p-4 rounded-lg mb-4 ${
          isSubmitting || isLoading ? 'bg-gray-400' : 'bg-secondary'
        }`}
      >
        {isSubmitting || isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-center text-white font-bold">Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("sign-up")}>
        <Text className="text-gray-200">Don't have an account? <Text className="text-~"> Sign Up </Text> </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default SignInScreen;
