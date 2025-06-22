import React from "react";
import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function OrderSummary() {
  const { venueId, courtId, slots } = useLocalSearchParams();
  const router = useRouter();

  // Parse slots from query parameter
  const selectedSlots = slots ? JSON.parse(decodeURIComponent(slots)) : [];
  
  // For demo, mock cost calculation
  const costPerSlot = 300; // e.g., LKR per 30 min slot
  const totalCost = costPerSlot * selectedSlots.length;

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <ScrollView>
        <Image
          source={{ uri: "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg" }}
          className="w-full h-40 rounded"
          resizeMode="cover"
        />
        <Text className="text-2xl font-bold mt-4 mb-2">Booking Summary</Text>
        <View className="bg-gray-100 p-4 rounded">
          <Text className="text-lg font-bold">Venue: {venueId}</Text>
          <Text className="text-lg font-bold">Court: {courtId}</Text>
          <Text className="mt-2">Selected Slots:</Text>
          {selectedSlots.length > 0 ? (
            selectedSlots.map((slot, index) => (
              <Text key={index} className="ml-4">- {slot}</Text>
            ))
          ) : (
            <Text className="ml-4">No slots selected.</Text>
          )}
          <Text className="mt-4 text-xl font-bold text-orange-500">
            Total Cost: {totalCost} LKR
          </Text>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => {
          // Payment logic here; for demo, simply alert and navigate back.
          alert("Payment Successful!");
          router.back();
        }}
        className="p-4 bg-orange-500 rounded mt-4"
      >
        <Text className="text-white text-center font-bold">Pay & Confirm Booking</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
