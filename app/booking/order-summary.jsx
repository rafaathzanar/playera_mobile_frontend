

import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Modal from "react-native-modal";
import Checkout from "./checkout";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function OrderSummary() {
  const { venueId, courtId, slots, totalDuration, totalCost, courtName, venueName } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [isModalVisible, setModalVisible] = useState(false);
  const [venue, setVenue] = useState(null);
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Fetch venue and court details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch venue details
        if (venueId) {
          const venueData = await api.getVenueById(venueId);
          setVenue(venueData);
        }
        
        // Fetch court details
        if (courtId) {
          const courtData = await api.getCourtById(courtId);
          setCourt(courtData);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        Alert.alert('Error', 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [venueId, courtId]);

  // Calculate costs
  const calculateCosts = () => {
    if (!court) return { courtCost: 0, totalCost: 0 };
    
    const courtCost = court.pricePerHour * totalDuration;
    const equipmentCost = 0; // Will be added when equipment selection is implemented
    const totalCost = courtCost + equipmentCost;
    
    return { courtCost, totalCost };
  };

  const { courtCost, totalCost: calculatedTotalCost } = calculateCosts();

  const handleProceed = () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please login to continue with your booking.');
      return;
    }
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  // Format time for display
  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white p-4">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg">Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Venue Image */}
        <Image
          source={{ 
            uri: venue?.imageUrl || "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg" 
          }}
          className="w-full h-44 rounded"
          resizeMode="cover"
        />

        {/* Booking Details */}
        <View className="bg-white p-4 rounded-t-[20px]">
          <Text className="text-lg font-bold text-gray-800">
            {venue?.name || venueName || 'Unknown Venue'}
          </Text>
          <Text className="text-lg font-bold text-gray-700 mt-2">
            {court?.courtName || courtName || 'Unknown Court'}
          </Text>
          
          {court && (
            <View className="mt-2">
              <Text className="text-gray-600">Type: {court.type}</Text>
              <Text className="text-gray-600">Surface: {court.surfaceType}</Text>
              {court.isIndoor && <Text className="text-gray-600">Indoor Court</Text>}
              {court.isLighted && <Text className="text-gray-600">Lighted Court</Text>}
            </View>
          )}

          <View className="mt-4">
            <Text className="text-lg font-bold text-gray-800">Selected Date & Time</Text>
            <Text className="text-gray-600 mt-1">
              {new Date().toLocaleDateString()} • {totalDuration} hours
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-lg font-bold text-gray-800">Selected Time Slots</Text>
            {selectedSlots.length > 0 ? (
              selectedSlots.map((slot, index) => (
                <Text key={index} className="ml-4 text-gray-600 mt-1">
                  • {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </Text>
              ))
            ) : (
              <Text className="ml-4 text-gray-500">No slots selected.</Text>
            )}
          </View>

          {/* Cost Breakdown */}
          <View className="mt-6 bg-gray-50 p-4 rounded-lg">
            <Text className="text-lg font-bold text-gray-800 mb-3">Cost Breakdown</Text>
            
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Court Rental ({totalDuration} hours)</Text>
              <Text className="text-gray-800">LKR {courtCost.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Equipment Rental</Text>
              <Text className="text-gray-800">LKR 0.00</Text>
            </View>
            
            <View className="border-t border-gray-300 pt-2 mt-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-800">Total Cost</Text>
                <Text className="text-xl font-bold text-orange-500">
                  LKR {calculatedTotalCost.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View className="mt-4 bg-blue-50 p-4 rounded-lg">
            <Text className="text-sm text-blue-800">
              💡 Booking includes court access for the selected time slots. 
              Equipment can be added during checkout if needed.
            </Text>
          </View>
        </View>

        {/* Pay & Confirm Button */}
        <TouchableOpacity
          onPress={handleProceed}
          className="bg-orange-500 mt-6 p-3 rounded-lg mr-3 ml-3"
        >
          <Text className="text-white text-center font-bold text-lg">
            Pay & Confirm Booking
          </Text>
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
          <Checkout 
            onClose={handleModalClose}
            bookingData={{
              venueId: parseInt(venueId),
              courtId: parseInt(courtId),
              customerId: user?.userId,
              bookingDate: new Date().toISOString().split('T')[0],
              startTime: selectedSlots[0]?.startTime,
              endTime: selectedSlots[selectedSlots.length - 1]?.endTime,
              duration: totalDuration,
              totalCost: calculatedTotalCost,
              selectedSlots: selectedSlots,
              court: court,
              venue: venue
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}