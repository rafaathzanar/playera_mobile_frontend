import React from "react";
import { SafeAreaView, View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CourtDetail() {
  const { courtId, venueId } = useLocalSearchParams();
  const router = useRouter();

  
  const courtDetails = {
    "c1": {
      courtName: "Court 1 (Indoor Futsal)",
      courtType: "Futsal",
      description: "High-quality indoor futsal court with professional lighting.",
      normalCharge: "300 LKR/30min",
      peakCharge: "350 LKR/30min",
      image: "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg",
    },
    "c2": {
      courtName: "Court 2 (Outdoor Futsal)",
      courtType: "Futsal",
      description: "Spacious outdoor futsal court with synthetic turf.",
      normalCharge: "350 LKR/30min",
      peakCharge: "400 LKR/30min",
      image: "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg",
    },
    
  };

  const court = courtDetails[courtId];

  if (!court) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-red-500">Court not found!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <Image source={{ uri: court.image }} className="w-full h-48" resizeMode="cover" />
        <View className="p-4">
          <Text className="text-2xl font-bold mb-2">{court.courtName}</Text>
          <Text className="text-gray-600 mb-2">{court.courtType}</Text>
          <Text className="text-gray-700 mb-2">{court.description}</Text>
          <Text className="text-gray-700 font-bold">Normal Charge: {court.normalCharge}</Text>
          <Text className="text-gray-700 mb-4 font-bold">Peak Charge: {court.peakCharge}</Text>
          <TouchableOpacity
            onPress={() => router.push(`/booking/slot-selection?venueId=${venueId}&courtId=${courtId}`)}
            className="bg-secondary p-3 rounded"
          >
            <Text className="text-white text-center font-bold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
