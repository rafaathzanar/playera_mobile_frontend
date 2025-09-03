import React, { useState, useEffect } from "react";
import { 
  SafeAreaView, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert,
  ActivityIndicator,
  TextInput,
  Image
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon, CheckCircleIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function Checkout() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  // Parse time slot ranges if available (for discontinuous slots)
  const timeSlotRanges = (() => {
    try {
      console.log('=== CHECKOUT PARSING DEBUG ===');
      console.log('Raw params.timeSlotRanges:', params.timeSlotRanges);
      const parsed = params.timeSlotRanges ? JSON.parse(params.timeSlotRanges) : null;
      console.log('Parsed timeSlotRanges:', parsed);
      console.log('=== END CHECKOUT PARSING DEBUG ===');
      return parsed;
    } catch (error) {
      console.error('Error parsing timeSlotRanges:', error);
      return null;
    }
  })();

  // Parse the data from params
  const [bookingData, setBookingData] = useState({
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
    selectedSlots: (() => {
      try {
        return JSON.parse(params.selectedSlots || '[]');
      } catch (error) {
        console.error('Error parsing selectedSlots:', error);
        return [];
      }
    })(),
    selectedEquipment: (() => {
      try {
        return JSON.parse(params.selectedEquipment || '[]');
      } catch (error) {
        console.error('Error parsing selectedEquipment:', error);
        return [];
      }
    })(),
    customerId: params.customerId,
    specialRequests: params.specialRequests || '',
    timeSlotRanges: timeSlotRanges || []
  });

  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Validate that we have all required data
  useEffect(() => {
    if (!bookingData.venueId || !bookingData.courtId || !bookingData.customerId) {
      Alert.alert("Error", "Missing booking information. Please go back and try again.");
      navigation.goBack();
      return;
    }
  }, [bookingData]);

  const handleCreateBooking = async () => {
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to continue with your booking.");
      return;
    }

    try {
      setLoading(true);

      // Use the already parsed time slot ranges

      // Prepare the booking request in the format expected by the backend
      const bookingRequest = {
        customerId: parseInt(bookingData.customerId),
        bookingDate: bookingData.selectedDate, // Should be in YYYY-MM-DD format
        startTime: bookingData.startTime, // Should be in HH:MM:SS format
        endTime: bookingData.endTime, // Should be in HH:MM:SS format
        duration: Math.round(bookingData.totalDuration), // Must be integer, round to handle decimal durations
        specialRequests: bookingData.specialRequests || "",
        // Court bookings
        courtBookings: [{
          courtId: parseInt(bookingData.courtId),
          timeDuration: Math.round(bookingData.totalDuration) // Ensure integer for validation
        }],
        // Equipment bookings
        equipmentBookings: bookingData.selectedEquipment && bookingData.selectedEquipment.length > 0 
          ? bookingData.selectedEquipment.map(equipment => ({
              equipmentId: parseInt(equipment.id),
              quantity: parseInt(equipment.quantity),
              timeDuration: Math.round(bookingData.totalDuration)
            }))
          : [],
        // NEW: Time slot ranges for discontinuous booking
        timeSlotRanges: timeSlotRanges || []
      };

      console.log('Creating booking with data:', bookingRequest);
      console.log('Current user:', user);
      console.log('User ID:', user?.userId);
      console.log('Customer ID in request:', bookingRequest.customerId);
      console.log('Time Slot Ranges:', timeSlotRanges);
      console.log('Raw booking data from params:', {
        selectedDate: bookingData.selectedDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        totalDuration: bookingData.totalDuration,
        customerId: bookingData.customerId,
        timeSlotRanges: params.timeSlotRanges
      });

      // Validate required fields
      if (!bookingRequest.customerId || !bookingRequest.bookingDate || !bookingRequest.startTime || !bookingRequest.endTime) {
        Alert.alert("Validation Error", "Missing required booking information. Please try again.");
        setLoading(false);
        return;
      }

      if (!bookingRequest.courtBookings || bookingRequest.courtBookings.length === 0) {
        Alert.alert("Validation Error", "No court selected for booking. Please try again.");
        setLoading(false);
        return;
      }

      // Check token status before creating booking
      const token = await api.getAuthToken();
      console.log('Current token:', token ? 'Present' : 'Missing');
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
      }
      
      // Test token validity by making a simple API call
      try {
        console.log('Testing token validity...');
        await api.getUserProfile();
        console.log('Token is valid');
      } catch (error) {
        console.error('Token validation failed:', error);
        Alert.alert(
          'Session Expired', 
          'Your session has expired. Please log in again to continue.',
          [
            { text: 'OK', onPress: () => {
              router.replace('/(auth)/sign-in');
            }}
          ]
        );
        setLoading(false);
        return;
      }
      
      // Create the booking
      const createdBookingResponse = await api.createBooking(bookingRequest);
      console.log('Booking created:', createdBookingResponse);

      if (createdBookingResponse && createdBookingResponse.bookingId) {
        setCreatedBooking(createdBookingResponse);
        setBookingSuccess(true);
        
        // Show success message
        Alert.alert(
          'Booking Successful! 🎉',
          'Your court booking has been confirmed. You will receive a confirmation email shortly.',
          [
            {
              text: 'View My Bookings',
              onPress: () => {
                // Navigate to booking history
                router.push('/profile');
              }
            },
            {
              text: 'OK',
              onPress: () => {
                // Go back to venue page
                router.push(`/venue/${bookingData.venueId}`);
              }
            }
          ]
        );
      } else {
        throw new Error('Invalid booking response');
      }

    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Check if it's a 403 error (likely token expired)
      if (error.message && error.message.includes('403')) {
        Alert.alert(
          'Session Expired', 
          'Your session has expired. Please log in again to continue.',
          [
            { text: 'OK', onPress: () => {
              // Navigate to login
              router.replace('/(auth)/sign-in');
            }}
          ]
        );
      } else {
        Alert.alert(
          'Booking Failed', 
          error.message || 'Failed to create booking. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
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
    if (!timeString) return '';
    
    console.log('=== FORMAT TIME DEBUG ===');
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

  if (bookingSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Success Header */}
          <View className="bg-green-500 p-6">
            <View className="items-center">
              <CheckCircleIcon size={64} color="white" />
              <Text className="text-2xl font-bold text-white mt-4">Booking Confirmed!</Text>
              <Text className="text-white text-center mt-2">
                Your booking has been successfully created
              </Text>
            </View>
          </View>

          {/* Booking Details */}
          <View className="p-6">
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">Booking Details</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Booking ID:</Text>
                  <Text className="font-medium">#{createdBooking?.bookingId}</Text>
                </View>
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
                    {(() => {
                      console.log('=== CHECKOUT TIME DISPLAY DEBUG ===');
                      console.log('bookingData.timeSlotRanges:', bookingData.timeSlotRanges);
                      console.log('timeSlotRanges length:', bookingData.timeSlotRanges?.length);
                      console.log('condition result:', bookingData.timeSlotRanges && bookingData.timeSlotRanges.length > 0);
                      console.log('=== END CHECKOUT TIME DISPLAY DEBUG ===');
                      
                      return bookingData.timeSlotRanges && bookingData.timeSlotRanges.length > 0 ? (
                        <View className="items-end">
                          <Text className="text-xs text-green-600 mb-1">✓ Individual Ranges ({bookingData.timeSlotRanges.length})</Text>
                          {bookingData.timeSlotRanges.map((range, index) => (
                            <Text key={`checkout-range-${index}`} className="font-medium text-right">
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
                      );
                    })()}
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total Cost:</Text>
                  <Text className="font-bold text-green-600">LKR {bookingData.totalCost.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Next Steps */}
            <View className="bg-blue-50 rounded-lg p-4 mb-4">
              <Text className="text-lg font-semibold text-blue-800 mb-2">What's Next?</Text>
              <Text className="text-blue-700 text-sm">
                • You'll receive a confirmation email with your booking details{'\n'}
                • Arrive 10 minutes before your scheduled time{'\n'}
                • Check in at the venue reception{'\n'}
                • Enjoy your game!
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => router.push('/profile')}
                className="bg-blue-600 p-4 rounded-lg"
              >
                <Text className="text-center text-white font-semibold text-lg">
                  View My Bookings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(`/venue/${bookingData.venueId}`)}
                className="bg-gray-600 p-4 rounded-lg"
              >
                <Text className="text-center text-white font-semibold text-lg">
                  Back to Venue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
          <Text className="text-xl font-bold text-white ml-4">Complete Booking</Text>
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
              <Text className="text-gray-600">Total Cost:</Text>
              <Text className="font-bold text-orange-600">LKR {bookingData.totalCost.toFixed(2)}</Text>
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
        {bookingData.specialRequests && (
          <View className="p-4">
            <Text className="text-lg font-semibold mb-3">Special Requests</Text>
            <View className="bg-blue-50 p-3 rounded-lg">
              <Text className="text-blue-800">{bookingData.specialRequests}</Text>
            </View>
          </View>
        )}

        {/* Important Information */}
        <View className="p-4">
          <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 font-semibold mb-2">Important Information</Text>
            <Text className="text-yellow-700 text-sm">
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
            By confirming this booking, you agree to our terms and conditions, 
            cancellation policy, and venue rules.
          </Text>
        </View>

        {/* Confirm Booking Button */}
        <View className="p-4">
          <TouchableOpacity
            onPress={handleCreateBooking}
            disabled={loading}
            className={`p-4 rounded-lg ${
              loading ? 'bg-gray-300' : 'bg-orange-500'
            }`}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Creating Booking...
                </Text>
              </View>
            ) : (
              <Text className="text-center text-white font-semibold text-lg">
                Confirm & Create Booking
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoBack}
            className="p-4 border border-gray-300 rounded-lg mt-3"
          >
            <Text className="text-center text-gray-700 font-medium">
              Back to Order Summary
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}