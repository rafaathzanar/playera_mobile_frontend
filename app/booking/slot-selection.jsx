import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, TouchableOpacity, Text, View, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function SlotSelection() {
  const router = useRouter();
  const { venueId, courtId } = useLocalSearchParams();
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [court, setCourt] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useAuth();

  // Fetch court and venue details
  useEffect(() => {
    const fetchCourtAndVenueDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch court details
        if (courtId) {
          const courtData = await api.getCourtById(courtId);
          setCourt(courtData);
          
          // Fetch venue details
          if (courtData.venue) {
            setVenue(courtData.venue);
          }
        }
        
        // Fetch available slots for today
        if (courtId && selectedDate) {
          await fetchAvailableSlots(selectedDate);
        }
      } catch (error) {
        console.error('Error fetching court/venue details:', error);
        Alert.alert('Error', 'Failed to load court information');
      } finally {
        setLoading(false);
      }
    };

    fetchCourtAndVenueDetails();
  }, [courtId]);

  // Fetch available slots when date changes
  const fetchAvailableSlots = async (date) => {
    try {
      if (!courtId || !date) return;
      
      const slots = await api.getAvailableSlots(courtId, date);
      
      // Convert backend slots to frontend format
      const formattedSlots = slots.map(slot => ({
        id: slot.id,
        time: `${slot.startTime} - ${slot.endTime}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: slot.status === 'AVAILABLE',
        slot: slot
      }));
      
      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      Alert.alert('Error', 'Failed to load available slots');
    }
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    const newDate = day.dateString;
    setSelectedDate(newDate);
    setSelectedSlots([]); // Reset selected slots when date changes
    fetchAvailableSlots(newDate);
  };

  const toggleSlot = (slot) => {
    if (!slot.available) return;
    
    setSelectedSlots((prev) => {
      const isSelected = prev.some(s => s.id === slot.id);
      if (isSelected) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleProceed = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('No Slots Selected', 'Please select at least one time slot to continue.');
      return;
    }

    // Calculate total duration and cost
    const totalDuration = selectedSlots.length * 0.5; // 30 minutes per slot
    const totalCost = court ? (court.pricePerHour * totalDuration) : 0;

    // Navigate to order summary with booking details
    router.push({
      pathname: '/booking/order-summary',
      params: {
        venueId: venueId,
        courtId: courtId,
        date: selectedDate,
        slots: encodeURIComponent(JSON.stringify(selectedSlots)),
        totalDuration: totalDuration,
        totalCost: totalCost,
        courtName: court?.courtName || 'Unknown Court',
        venueName: venue?.name || 'Unknown Venue'
      }
    });
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
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View>
        <View className="flex-row items-center p-2" style={{ backgroundColor: '#FF4B00' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="pr-1">
            <ArrowLeftIcon size={20} color="white" style={{ marginLeft: 15 }} />
          </TouchableOpacity>
          <Text className="font-bold text-lg text-white text-center flex-1">
            {court?.courtName || 'COURT BOOKING'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="p-4">
        {/* Court and Venue Info */}
        {court && (
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-lg font-bold text-gray-800">{court.courtName}</Text>
            <Text className="text-gray-600">{venue?.name}</Text>
            <Text className="text-gray-600">Type: {court.type}</Text>
            <Text className="text-gray-600">Price: LKR {court.pricePerHour}/hour</Text>
            {court.description && (
              <Text className="text-gray-600 mt-2">{court.description}</Text>
            )}
          </View>
        )}

        {/* Selected Date */}
        <Text className="text-lg text-orange-500 mb-4">{selectedDate}</Text>

        {/* Interactive Calendar */}
        <Calendar
          current={selectedDate}
          onDayPress={handleDateSelect}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: "#FF4B00" },
          }}
          theme={{
            backgroundColor: "white",
            calendarBackground: "white",
            textSectionTitleColor: "#000",
            dayTextColor: "#000",
            arrowColor: "#FF4B00",
            todayTextColor: "#FF4B00",
          }}
          style={{ marginBottom: 16, borderRadius: 8, elevation: 2 }}
          minDate={new Date().toISOString().split('T')[0]}
        />

        {/* Available Slots */}
        <Text className="text-lg font-bold mb-4">Available Time Slots</Text>
        
        {availableSlots.length === 0 ? (
          <View className="bg-gray-100 p-4 rounded-lg">
            <Text className="text-center text-gray-600">No available slots for this date</Text>
          </View>
        ) : (
          availableSlots.map((slot) => (
            <View key={slot.id} className="flex-row justify-between items-center p-3 mb-2 bg-white border border-gray-200 rounded-lg">
              <Text style={{ color: '#FF4B00' }} className="font-medium">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </Text>

              <TouchableOpacity
                onPress={() => toggleSlot(slot)}
                className={`px-6 py-2 rounded-lg ${
                  selectedSlots.some(s => s.id === slot.id) 
                    ? "bg-orange-500" 
                    : slot.available 
                      ? "bg-gray-200" 
                      : "bg-gray-400"
                }`}
                disabled={!slot.available}
              >
                <Text className={`${
                  selectedSlots.some(s => s.id === slot.id) 
                    ? "text-white" 
                    : "text-black"
                } font-medium`}>
                  {selectedSlots.some(s => s.id === slot.id) ? "Selected" : "Available"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Selected Slots Summary */}
        {selectedSlots.length > 0 && (
          <View className="bg-orange-50 p-4 rounded-lg mt-4 mb-4">
            <Text className="text-lg font-bold text-orange-800 mb-2">
              Selected Slots ({selectedSlots.length})
            </Text>
            {selectedSlots.map((slot, index) => (
              <Text key={index} className="text-orange-700">
                • {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </Text>
            ))}
            <Text className="text-lg font-bold text-orange-800 mt-2">
              Total Duration: {(selectedSlots.length * 0.5).toFixed(1)} hours
            </Text>
            {court && (
              <Text className="text-lg font-bold text-orange-800">
                Total Cost: LKR {(court.pricePerHour * selectedSlots.length * 0.5).toFixed(2)}
              </Text>
            )}
          </View>
        )}

        {/* Proceed Button */}
        <TouchableOpacity
          onPress={handleProceed}
          disabled={selectedSlots.length === 0}
          className={`mt-6 p-3 rounded-lg mr-3 ml-3 ${
            selectedSlots.length > 0 ? "bg-orange-500" : "bg-gray-300"
          }`}
        >
          <Text className={`text-center font-bold ${
            selectedSlots.length > 0 ? "text-white" : "text-gray-500"
          }`}>
            Confirm and Checkout ({selectedSlots.length} slots)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}