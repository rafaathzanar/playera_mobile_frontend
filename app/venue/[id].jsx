import React, { useState } from "react";
import { SafeAreaView, View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
const venuesData = {
  "1": {
    name: "Colombo Futsal Club",
    address: "70 Galle Road, Dehiwala",
    contact: "077 969 4278",
    image:
      "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg",
    description: "A premier indoor sports facility with world-class amenities.",
    courts: [
      { id: "c1", name: "Court 1 ", price: "300 LKR/30min" },
      { id: "c2", name: "Court 2 ", price: "350 LKR/30min" },
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
  const navigation = useNavigation('/'); // Get navigation object

  // State to track which court(s) are pressed/booked
  // We'll keep a Set of pressed court ids for flexibility (multi-select)
  const [bookedCourts, setBookedCourts] = useState(new Set());

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-red-500">Venue not found!</Text>
      </SafeAreaView>
    );
  }

  const toggleBook = (courtId) => {
    setBookedCourts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courtId)) {
        newSet.delete(courtId);
      } else {
        newSet.add(courtId);
      }
      return newSet;
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Venue Banner */}

        <View>
          <View className="flex-row items-center  p-2" style={{ backgroundColor: '#FF4B00' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="pr-1">
                         <ArrowLeftIcon size={20} color="white" style={{ marginLeft: 15 }} />
                       </TouchableOpacity>
            <Text className="font-bold text-lg text-white text-center flex-1">
              VENUE DETAILS
            </Text>

            {/* Spacer to balance the layout since text is centered */}
            <View style={{ width: 24 }} />
          </View>
        </View>
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
          <Text style={{ color: '#238AFF' }} className="text-xl font-semibold mb-4">
            COURTS
          </Text>

          {venue.courts.map((court) => {
            const isBooked = bookedCourts.has(court.id);

            return (
              <View
                key={court.id}
                className="flex-row justify-between items-center mb-4 rounded-[5px] px-4 py-4 "
                style={{ backgroundColor: '#F1F3F5' }}
              >
                <View>
                  <Text className="text-lg font-bold">{court.name}</Text>
                  <Text className="text-gray-600">{court.price}</Text>
                </View>

                <View className="flex-row gap-2">
                  {/* View Button (border only) */}
                  <TouchableOpacity
                    onPress={() => router.push(`venue/court/${court.id}`)}
                    activeOpacity={0.8}
                    className="h-10 w-24 rounded-[5px]  bg-white border border-orange-500 justify-center"
                  >
                    <Text className="text-orange-500 font-semibold text-center text-base">
                      View
                    </Text>
                  </TouchableOpacity>

                  {/* Book Button (orange background) */}
                  <TouchableOpacity
                    onPress={() => toggleBook(court.id)}
                    activeOpacity={0.8}
                    className={`h-10 w-24 rounded-[5px]  border-2 justify-center ${bookedCourts.has(court.id)
                        ? "bg-secondary border-orange-500"
                        : "bg-secondary border-orange-500"
                      }`}
                  >
                    <Text className="text-white font-semibold text-center text-base">
                      {bookedCourts.has(court.id) ? "Booked" : "Book"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );


          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
