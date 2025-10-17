

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
import { formatDateForDisplay } from "../../utils/dateUtils";

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
    courtCost: parseFloat(params.courtCost) || 0, // Court cost only
    equipmentCost: parseFloat(params.equipmentCost) || 0, // Equipment cost only
    courtName: params.courtName,
    venueName: params.venueName,
    selectedSlots: JSON.parse(params.selectedSlots || '[]'),
    timeSlotRanges: JSON.parse(params.timeSlotRanges || '[]'), // NEW: Parse time slot ranges
    selectedEquipment: JSON.parse(params.selectedEquipment || '[]'),
    customerId: params.customerId,
    // Loyalty-related parameters
    goldCoinsToRedeem: params.goldCoinsToRedeem || '0',
    loyaltyTier: params.loyaltyTier || 'BRONZE',
    tierDiscount: parseFloat(params.tierDiscount) || 0,
    goldCoinDiscount: parseFloat(params.goldCoinDiscount) || 0
  });

  // Update the state when params change
  useEffect(() => {
    console.log('=== PARAMS CHANGE DETECTED ===');
    console.log('New params:', params);
    setBookingData({
      venueId: params.venueId,
      courtId: params.courtId,
      selectedDate: params.selectedDate,
      startTime: params.startTime,
      endTime: params.endTime,
      totalDuration: parseFloat(params.totalDuration),
      totalCost: parseFloat(params.totalCost),
      courtCost: parseFloat(params.courtCost) || 0,
      equipmentCost: parseFloat(params.equipmentCost) || 0,
      courtName: params.courtName,
      venueName: params.venueName,
      selectedSlots: JSON.parse(params.selectedSlots || '[]'),
      timeSlotRanges: JSON.parse(params.timeSlotRanges || '[]'),
      selectedEquipment: JSON.parse(params.selectedEquipment || '[]'),
      customerId: params.customerId,
      // Loyalty-related parameters
      goldCoinsToRedeem: params.goldCoinsToRedeem || '0',
      loyaltyTier: params.loyaltyTier || 'BRONZE',
      tierDiscount: parseFloat(params.tierDiscount) || 0,
      goldCoinDiscount: parseFloat(params.goldCoinDiscount) || 0
    });
    // Force re-render when timeSlotRanges change
    setRenderKey(prev => prev + 1);
  }, [params.venueId, params.courtId, params.selectedDate, params.startTime, params.endTime, params.timeSlotRanges]);

  // Debug logging
  useEffect(() => {
    console.log('=== ORDER SUMMARY DEBUG ===');
    console.log('Raw params.timeSlotRanges:', params.timeSlotRanges);
    console.log('Parsed timeSlotRanges:', bookingData.timeSlotRanges);
    console.log('startTime:', bookingData.startTime);
    console.log('endTime:', bookingData.endTime);
    console.log('timeSlotRanges length:', bookingData.timeSlotRanges?.length);
    console.log('timeSlotRanges condition:', bookingData.timeSlotRanges && bookingData.timeSlotRanges.length > 0);
    console.log('=== END DEBUG ===');
  }, [bookingData]);

  // Component render debug
  console.log('=== COMPONENT RENDER ===');
  console.log('Current bookingData.timeSlotRanges:', bookingData.timeSlotRanges);
  console.log('Current bookingData.timeSlotRanges length:', bookingData.timeSlotRanges?.length);
  console.log('=== END COMPONENT RENDER ===');

  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Calculate total cost (already calculated in slot selection)
  const calculateTotalCost = () => {
    // The totalCost already includes both court and equipment costs
    return bookingData.totalCost || 0;
  };

  // Validate that we have all required data
  useEffect(() => {
    if (!bookingData.venueId || !bookingData.courtId || !bookingData.selectedDate) {
      Alert.alert("Error", "Missing booking information. Please go back and try again.");
      navigation.goBack();
      return;
    }
  }, [bookingData]);

  const handleProceedToPayment = () => {
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to continue with your booking.");
      return;
    }

    // Navigate to payment screen with all the booking data
    router.push({
      pathname: "/booking/payment",
      params: {
        venueId: bookingData.venueId,
        courtId: bookingData.courtId,
        selectedDate: bookingData.selectedDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        totalDuration: bookingData.totalDuration.toString(),
        totalCost: calculateTotalCost().toString(),
        courtCost: bookingData.courtCost.toString(),
        equipmentCost: bookingData.equipmentCost.toString(),
        courtName: bookingData.courtName,
        venueName: bookingData.venueName,
        selectedSlots: JSON.stringify(bookingData.selectedSlots),
        timeSlotRanges: JSON.stringify(bookingData.timeSlotRanges), // Pass time slot ranges to payment
        selectedEquipment: JSON.stringify(bookingData.selectedEquipment),
        customerId: user.userId,
        specialRequests: specialRequests
      }
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString) => {
    return formatDateForDisplay(dateString);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    console.log('=== ORDER SUMMARY FORMAT TIME DEBUG ===');
    console.log('Input timeString:', timeString);
    console.log('Type:', typeof timeString);
    console.log('Length:', timeString.length);
    
    // Handle LocalTime format from backend (HH:MM:SS)
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const formatted = timeString.substring(0, 5); // "06:00:00" -> "06:00"
      console.log('LocalTime format (HH:MM:SS), returning:', formatted);
      return formatted;
    }
    
    // If it's already in HH:MM format, return as is
    if (typeof timeString === 'string' && timeString.includes(':') && timeString.split(':').length === 2) {
      console.log('Already HH:MM format, returning:', timeString);
      return timeString;
    }
    
    // If it's in HH:MM:SS format, remove seconds
    if (typeof timeString === 'string' && timeString.includes(':') && timeString.split(':').length === 3) {
      const formatted = timeString.substring(0, 5);
      console.log('HH:MM:SS format, returning:', formatted);
      return formatted;
    }
    
    console.log('No format match, returning original:', timeString);
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
    <SafeAreaView key={renderKey} className="flex-1 bg-white">
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
              <View className="flex-1 items-end">
                {bookingData.timeSlotRanges && bookingData.timeSlotRanges.length > 0 ? (
                  <View className="items-end">
                    <Text className="text-xs text-green-600 mb-1">✓ Individual Ranges ({bookingData.timeSlotRanges.length})</Text>
                    {bookingData.timeSlotRanges.map((range, index) => (
                      <Text key={`range-${index}`} className="font-medium text-right">
                        {formatTime(range.startTime)} - {formatTime(range.endTime)}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <View className="items-end">
                    <Text className="text-xs text-orange-600 mb-1">⚠ Overall Span</Text>
                    <Text className="font-medium">
                      {formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Duration:</Text>
              <Text className="font-medium">
                {bookingData.timeSlotRanges && bookingData.timeSlotRanges.length > 0 
                  ? bookingData.timeSlotRanges.reduce((total, range) => total + range.duration, 0) 
                  : bookingData.totalDuration} hours
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Court Cost:</Text>
              <Text className="font-medium">LKR {bookingData.courtCost.toFixed(2)}</Text>
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

        {/* Cost Breakdown */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-3">Cost Breakdown</Text>
          <View className="bg-gray-50 p-4 rounded-lg space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Court Cost:</Text>
              <Text className="font-medium">LKR {bookingData.courtCost.toFixed(2)}</Text>
            </View>
            {bookingData.equipmentCost > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Equipment Cost:</Text>
                <Text className="font-medium">LKR {bookingData.equipmentCost.toFixed(2)}</Text>
              </View>
            )}
            
            {/* Subtotal (before discounts) */}
            {(bookingData.tierDiscount > 0 || bookingData.goldCoinDiscount > 0) && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Subtotal:</Text>
                <Text className="font-medium">LKR {(bookingData.courtCost + bookingData.equipmentCost).toFixed(2)}</Text>
              </View>
            )}
            
            {/* Loyalty Discounts */}
            {(bookingData.tierDiscount > 0 || bookingData.goldCoinDiscount > 0) && (
              <>
                <View className="border-t border-gray-300 pt-2 mt-2">
                  <Text className="text-sm font-semibold text-green-600 mb-2">Loyalty Discounts</Text>
                </View>
                
                {bookingData.tierDiscount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Tier Discount ({bookingData.loyaltyTier}):</Text>
                    <Text className="font-medium text-green-600">-LKR {bookingData.tierDiscount.toFixed(2)}</Text>
                  </View>
                )}
                
                {bookingData.goldCoinDiscount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Gold Coins ({bookingData.goldCoinsToRedeem} coins):</Text>
                    <Text className="font-medium text-green-600">-LKR {bookingData.goldCoinDiscount.toFixed(2)}</Text>
                  </View>
                )}
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total Discount:</Text>
                  <Text className="font-medium text-green-600">
                    -LKR {(bookingData.tierDiscount + bookingData.goldCoinDiscount).toFixed(2)}
                  </Text>
                </View>
              </>
            )}
            
            <View className="border-t border-gray-300 pt-2 mt-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-orange-800">Total Cost</Text>
                <Text className="text-xl font-bold text-orange-600">
                  LKR {calculateTotalCost().toFixed(2)}
                </Text>
              </View>
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
            onPress={handleProceedToPayment}
            disabled={loading}
            className={`p-4 rounded-lg ${
              loading ? 'bg-gray-300' : 'bg-orange-500'
            }`}
          >
            <Text className="text-center text-white font-semibold text-lg">
              {loading ? 'Processing...' : 'Proceed to Payment'}
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