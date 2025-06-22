import React from "react";
import { SafeAreaView, View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const venuesData = {
  "1": {
    name: "Colombo Futsal Club",
    address: "70 Galle Road, Dehiwala",
    contact: "077 969 4278",
    image:
      "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg",
    description: "A premier indoor sports facility with world-class amenities.",
    courts: [
      { id: "c1", name: "Court 1 (Indoor Futsal)", price: "300 LKR/30min" },
      { id: "c2", name: "Court 2 (Outdoor Futsal)", price: "350 LKR/30min" },
    ],
  },
  "2": {
    name: "Royal Tennis Court",
    address: "123 Main Street, Colombo",
    contact: "077 111 2222",
    image:
      "https://media.istockphoto.com/id/471621500/photo/tennis-court-with-tennis-ball-close-up.jpg?s=612x612&w=0&k=20&c=K4kHMI9lxAl2L_s6CfKdR_VOHWcjx6KDHXJNRN35myc=",
    description: "Experience premium tennis facilities with modern equipment.",
    courts: [
      { id: "c3", name: "Court A (Clay)", price: "400 LKR/30min" },
      { id: "c4", name: "Court B (Hard)", price: "450 LKR/30min" },
    ],
  },
};

export default function VenueDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const venue = venuesData[id];

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-red-500">Venue not found!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Venue Banner */}
        <Image source={{ uri: venue.image }} className="w-full h-48" resizeMode="cover" />
        {/* Venue Info */}
        <View className="p-4">
          <Text className="text-2xl font-bold mb-2">{venue.name}</Text>
          <Text className="text-gray-600">{venue.address}</Text>
          <Text className="text-gray-600">Contact: {venue.contact}</Text>
          <Text className="mt-2 text-gray-700">{venue.description}</Text>
        </View>
        {/* Courts Listing */}
        <View className="p-4">
          <Text className="text-xl font-semibold mb-4">Available Courts</Text>
          {venue.courts.map((court) => (
            <View key={court.id} className="flex-row justify-between items-center mb-4 border-b pb-2">
              <View>
                <Text className="text-lg font-bold">{court.name}</Text>
                <Text className="text-gray-600">{court.price}</Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => router.push(`/venue/court/${court.id}?venueId=${id}`)}
                  className="bg-blue-500 p-2 rounded mr-2"
                >
                  <Text className="text-white">View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/booking/slot-selection?venueId=${id}&courtId=${court.id}`)}
                  className="bg-green-500 p-2 rounded"
                >
                  <Text className="text-white">Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
