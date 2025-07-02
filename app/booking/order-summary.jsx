

import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Modal from "react-native-modal";
import Checkout from "./checkout";


import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

export default function OrderSummary() {
  const { venueId, courtId, slots } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation(); // Get navigation object

  // Parse slots from query parameter with error handling
  let selectedSlots = [];
  try {
    selectedSlots = slots ? JSON.parse(decodeURIComponent(slots)) : [];
    if (!Array.isArray(selectedSlots)) {
      selectedSlots = [];
    }
  } catch (error) {
    console.error("Error parsing slots:", error);
    selectedSlots = [];
  }

  // For demo, mock cost calculation
  const costPerSlot = 300; // e.g., LKR per 30 min slot
  const totalCost = costPerSlot * selectedSlots.length;

  // State to control modal visibility
  const [isModalVisible, setModalVisible] = useState(false);

  const handleProceed = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <ScrollView>
        {/* Header Section */}
        <View>
          <View className="flex-row items-center p-2" style={{ backgroundColor: '#FF4B00' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} className="pr-1">
              <ArrowLeftIcon size={20} color="white" style={{ marginLeft: 15 }} />
            </TouchableOpacity>
            <Text className="font-bold text-lg text-white text-center flex-1">
              BOOKING DETAILS
            </Text>
            {/* Spacer to balance the layout since text is centered */}
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Venue Image */}
        <Image
          source={{ uri: "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg" }}
          className="w-full h-44 rounded"
          resizeMode="cover"
        />

        {/* Booking Details */}
        <View className="bg-white p-4 rounded-t-[20px]">
          <Text className="text-lg font-bold">Venue: {venueId || 'Unknown'}</Text>
          <Text className="text-lg font-bold">Court: {courtId || 'Unknown'}</Text>
          <Text className="mt-2">Selected Slots:</Text>
          {selectedSlots.length > 0 ? (
            selectedSlots.map((slot, index) => (
              <Text key={index} className="ml-4">- {String(slot)}</Text>
            ))
          ) : (
            <Text className="ml-4">No slots selected.</Text>
          )}
          <Text className="mt-4 text-xl font-bold text-orange-500">
            Total Cost: {totalCost} LKR
          </Text>
        </View>

        {/* Pay & Confirm Button */}
        <TouchableOpacity
          onPress={handleProceed}
          className="bg-secondary mt-6 p-3 rounded-[5px] mr-3 ml-3"
        >
          <Text className="text-white text-center font-bold">Pay & Confirm Booking</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Checkout */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={handleModalClose}
        onBackButtonPress={handleModalClose}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <View className="bg-white rounded-t-[20px] p-4 h-3/4">
          <Checkout onClose={handleModalClose} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}