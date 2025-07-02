import React from "react";
import { SafeAreaView, View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

export default function CourtDetail() {
  const { courtId, venueId } = useLocalSearchParams();
  const router = useRouter();
 const navigation = useNavigation('/venue/[id]'); // Get navigation object

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
           <View>
          <View className="flex-row items-center  p-2" style={{ backgroundColor: '#FF4B00' }}>
             <TouchableOpacity onPress={() => navigation.goBack()} className="pr-1">
                         <ArrowLeftIcon size={20} color="white" style={{ marginLeft: 15 }} />
                       </TouchableOpacity>
            <Text className="font-bold text-lg text-white text-center flex-1">
            COURT DETAILS
            </Text>

            {/* Spacer to balance the layout since text is centered */}
            <View style={{ width: 24 }} />
          </View>
        </View>
        {/* <Text className="font-bold text-lg black text-center p-3">COURT DETAILS</Text> */}
        <Image source={{ uri: court.image }} className="w-full h-48" resizeMode="cover" />
        <View className="p-4">
          <Text className="text-2xl font-bold mb-2">{court.courtName}</Text>
          <Text className="text-gray-600 mb-2">{court.courtType}</Text>
          <Text className="text-gray-700 mb-2">{court.description}</Text>

          <Text style={{ color: '#238AFF' }} className="text-xl mt-4 font-semibold mb-4">
            COURTS
          </Text>
          <View className="p-6 justify-center rounded-[5px]"
            style={{ backgroundColor: '#F1F3F5' }}>

            <Text className=" text-center">
              <Text className="font-bold ">Normal Charge : </Text>
              <Text>{court.normalCharge}</Text>
            </Text>
            <Text className=" text-center mt-2">
              <Text className="font-bold ">Peak Charge : </Text>
              <Text> {court.peakCharge}</Text>
            </Text>

          </View>

          <TouchableOpacity
            onPress={() => router.push(`/booking/slot-selection?venueId=${venueId}&courtId=${courtId}`)}
            className="bg-secondary mt-6 p-3 rounded-[5px]"
          >
            <Text className="text-white text-center font-bold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
