

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function OrderSummary() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  // Parse the data from params
  const [bookingData, setBookingData] = useState({
    venueId: params.venueId,
    courtId: params.courtId,
    selectedDate: params.selectedDate,
    startTime: params.startTime,
    endTime: params.endTime,
    totalDuration: parseFloat(params.totalDuration),
    totalCost: parseFloat(params.totalCost),
    courtName: params.courtName,
    venueName: params.venueName,
    selectedSlots: JSON.parse(params.selectedSlots || '[]'),
    selectedEquipment: JSON.parse(params.selectedEquipment || '[]'),
    customerId: params.customerId
  });

  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate that we have all required data
  useEffect(() => {
    if (!bookingData.venueId || !bookingData.courtId || !bookingData.selectedDate) {
      Alert.alert("Error", "Missing booking information. Please go back and try again.");
      navigation.goBack();
      return;
    }
  }, [bookingData]);

  const handleProceedToCheckout = () => {
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to continue with your booking.");
      return;
    }

    // Navigate to checkout with all the booking data
    router.push({
      pathname: "/booking/checkout",
      params: {
        ...bookingData,
        specialRequests,
        customerId: user.userId
      }
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (!bookingData.venueId) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center p-4 bg-orange-500">
          <TouchableOpacity onPress={handleGoBack}>
            <ArrowLeftIcon size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-4">Order Summary</Text>
        </View>

        {/* Booking Summary */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-3">Booking Summary</Text>
          <View className="bg-gray-50 rounded-lg p-4 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Venue:</Text>
              <Text className="font-medium">{bookingData.venueName}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Court:</Text>
              <Text className="font-medium">{bookingData.courtName}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Date:</Text>
              <Text className="font-medium">{formatDate(bookingData.selectedDate)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Time:</Text>
              <Text className="font-medium">
                {formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Duration:</Text>
              <Text className="font-medium">{bookingData.totalDuration} hours</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Court Cost:</Text>
              <Text className="font-medium">LKR {bookingData.totalCost.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Equipment Summary */}
        {bookingData.selectedEquipment && bookingData.selectedEquipment.length > 0 && (
          <View className="p-4">
            <Text className="text-lg font-semibold mb-3">Equipment Summary</Text>
            <View className="space-y-2">
              {bookingData.selectedEquipment.map((equipment, index) => (
                <View key={index} className="bg-gray-50 p-3 rounded-lg">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-medium text-gray-800">{equipment.name}</Text>
                    <Text className="text-sm text-gray-600">Qty: {equipment.quantity}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Cost:</Text>
                    <Text className="font-medium">LKR {equipment.totalCost.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Special Requests */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-3">Special Requests (Optional)</Text>
          <TextInput
            value={specialRequests}
            onChangeText={setSpecialRequests}
            className="border border-gray-300 p-3 rounded-lg"
            placeholder="Any special requests or notes..."
            placeholderTextColor="gray"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Total Cost */}
        <View className="p-4">
          <View className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-orange-800">Total Cost</Text>
              <Text className="text-2xl font-bold text-orange-600">
                LKR {bookingData.totalCost.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Important Information */}
        <View className="p-4">
          <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Text className="text-blue-800 font-semibold mb-2">Important Information</Text>
            <Text className="text-blue-700 text-sm">
              • Please arrive 10 minutes before your scheduled time{'\n'}
              • Bring your own sports equipment unless rented{'\n'}
              • Cancellation policy: 24 hours notice required{'\n'}
              • Payment will be processed after booking confirmation
            </Text>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View className="p-4">
          <Text className="text-sm text-gray-600 text-center">
            By proceeding to checkout, you agree to our terms and conditions, 
            cancellation policy, and venue rules.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="p-4 space-y-3">
          <TouchableOpacity
            onPress={handleProceedToCheckout}
            disabled={loading}
            className={`p-4 rounded-lg ${
              loading ? 'bg-gray-300' : 'bg-orange-500'
            }`}
          >
            <Text className="text-center text-white font-semibold text-lg">
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoBack}
            className="p-4 border border-gray-300 rounded-lg"
          >
            <Text className="text-center text-gray-700 font-medium">
              Back to Slot Selection
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}