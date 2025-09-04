import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";

const SignUpScreen = () => {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userType: "CUSTOMER", // Default to customer
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateFields()) return;

    try {
      const userData = {
        name: user.name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        userType: user.userType,
        role: user.userType,
      };

      await register(userData);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.push("/(tabs)/home") }
      ]);
    } catch (error) {
      Alert.alert("Registration Failed", error.message || "Please try again");
    }
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
          returnKeyType="next"
          style={{ color: 'white' }}
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
          returnKeyType="next"
          style={{ color: 'white' }}
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
          returnKeyType="next"
          style={{ color: 'white' }}
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
          returnKeyType="next"
          style={{ color: 'white' }}
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
          returnKeyType="done"
          blurOnSubmit={true}
          style={{ color: 'white' }}
        />
        {errors.phone ? <Text className="text-red-500">{errors.phone}</Text> : null}

        {/* User Type Selection */}
        <View className="w-full mb-4">
          <Text className="text-white mb-2">Account Type</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg border ${
                user.userType === 'CUSTOMER' ? 'bg-secondary border-secondary' : 'border-secondary'
              }`}
              onPress={() => setUser({ ...user, userType: 'CUSTOMER' })}
            >
              <Text className={`text-center ${
                user.userType === 'CUSTOMER' ? 'text-white' : 'text-secondary'
              }`}>
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg border ${
                user.userType === 'VENUE_OWNER' ? 'bg-secondary border-secondary' : 'border-secondary'
              }`}
              onPress={() => setUser({ ...user, userType: 'VENUE_OWNER' })}
            >
              <Text className={`text-center ${
                user.userType === 'VENUE_OWNER' ? 'text-white' : 'text-secondary'
              }`}>
                Venue Owner
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      <TouchableOpacity
        onPress={handleSignUp}
        disabled={isLoading}
        className={`w-full p-4 rounded-lg mb-4 ${
          isLoading ? 'bg-gray-400' : 'bg-secondary'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-center text-white font-bold">Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("sign-in")}>
        <Text className="text-gray-200">Already have an account?<Text className="text-secondary"> Login </Text> </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;
