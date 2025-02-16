import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUpScreen = () => {
  const router = useRouter();
 const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const validateFields = () => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = "Name is required.";
    if (!user.email.trim() || !/\S+@\S+\.\S+/.test(user.email))
      newErrors.email = "Valid email is required.";
    if (!user.password.trim() || user.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (user.password !== user.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!user.phone.trim() || !/^\d{10}$/.test(user.phone))
      newErrors.phone = "Valid phone number is required.";
    if (!user.address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (!validateFields()) return;
    // Handle successful signup logic here
    console.log("User Details:", user);
    router.push("/welcome"); // Navigate to the welcome screen
  };


  return (
    <SafeAreaView className="bg-primary h-full">
    <View className="flex-1 justify-center items-center px-6">
<Text className="text-2xl font-bold text-secondary mb-6">Signup</Text>
     {/* Name */}
     <TextInput
          className="w-full  p-3 mb-4 rounded-lg border border-secondary"
          placeholder="Full Name"
          placeholderTextColor="#A9A9A9"
          value={user.name}
          onChangeText={(text) => setUser({ ...user, name: text })}
        />
        {errors.name ? <Text className="text-red-500">{errors.name}</Text> : null}

        {/* Email */}
        <TextInput
          className="w-full  p-3 mb-4 rounded-lg border border-secondary"
          placeholder="Email"
          placeholderTextColor="#A9A9A9"
          value={user.email}
          onChangeText={(text) => setUser({ ...user, email: text })}
          keyboardType="email-address"
        />
        {errors.email ? <Text className="text-red-500">{errors.email}</Text> : null}

        {/* Password */}
        <TextInput
          className="w-full  p-3 mb-4 rounded-lg border border-secondary"
          placeholder="Password"
          placeholderTextColor="#A9A9A9"
          value={user.password}
          onChangeText={(text) => setUser({ ...user, password: text })}
          secureTextEntry
        />
        {errors.password ? <Text className="text-red-500">{errors.password}</Text> : null}

        {/* Confirm Password */}
        <TextInput
          className="w-full p-3 mb-4 rounded-lg border border-secondary"
          placeholder="Confirm Password"
          placeholderTextColor="#A9A9A9"
          value={user.confirmPassword}
          onChangeText={(text) => setUser({ ...user, confirmPassword: text })}
          secureTextEntry
        />
        {errors.confirmPassword ? (
          <Text className="text-red-500">{errors.confirmPassword}</Text>
        ) : null}

        {/* Phone */}
        <TextInput
          className="w-full  p-3 mb-4 rounded-lg border border-secondary"
          placeholder="Phone Number"
          placeholderTextColor="#A9A9A9"
          value={user.phone}
          onChangeText={(text) => setUser({ ...user, phone: text })}
          keyboardType="phone-pad"
        />
        {errors.phone ? <Text className="text-red-500">{errors.phone}</Text> : null}

        {/* Address */}
        <TextInput
          className="w-full p-3 mb-4 rounded-lg border border-secondary"
          placeholder="Address"
          placeholderTextColor="#A9A9A9"
          value={user.address}
          onChangeText={(text) => setUser({ ...user, address: text })}
          multiline
        />
        {errors.address ? <Text className="text-red-500">{errors.address}</Text> : null}

      <TouchableOpacity
        onPress={handleSignUp}
        className="w-full bg-secondary p-4 rounded-lg mb-4"
      >
        <Text className="text-center text-white font-bold">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("sign-in")}>
        <Text className="text-gray-200">Already have an account?<Text className="text-secondary"> Login </Text> </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;
