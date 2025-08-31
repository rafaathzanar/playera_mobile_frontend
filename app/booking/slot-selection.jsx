import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function SlotSelection() {
  const { venueId, courtId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [court, setCourt] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch court, venue, and equipment data
  useEffect(() => {
    const fetchCourtAndVenueDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch court details
        const courtData = await api.getCourtById(courtId);
        setCourt(courtData);
        
        // Fetch venue details
        const venueData = await api.getVenueById(venueId);
        setVenue(venueData);
        
        // Fetch available equipment for this court
        await fetchEquipment();
        
      } catch (error) {
        console.error("Error fetching court and venue details:", error);
        Alert.alert("Error", "Failed to load court and venue information");
      } finally {
        setLoading(false);
      }
    };

    if (courtId && venueId) {
      fetchCourtAndVenueDetails();
    }
  }, [courtId, venueId]);

  // Fetch slots for the selected date when court is loaded
  useEffect(() => {
    if (court && selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [court, selectedDate]);

  // Fetch available equipment
  const fetchEquipment = async () => {
    try {
      setEquipmentLoading(true);
      const equipmentData = await api.getEquipment(venueId);
      setEquipment(equipmentData || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      setEquipment([]);
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Fetch available slots for selected date using real API
  const fetchAvailableSlots = async (date) => {
    try {
      if (!courtId || !date) {
        console.log('Missing required parameters:', { courtId, date });
        return;
      }
      
      setSlotsLoading(true);
      console.log('Fetching slots for court:', courtId, 'date:', date);
      
      // Use the real time slot API
      const availableSlots = await api.getAvailableTimeSlots(courtId, date);
      console.log('Available slots from API:', availableSlots);
      
      if (availableSlots && Array.isArray(availableSlots)) {
        // Transform the API response to match our format
        const formattedSlots = availableSlots.map(slot => ({
          id: `${slot.courtId}-${slot.date}-${slot.startTime}`,
          time: `${slot.startTime} - ${slot.endTime}`,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: slot.status === 'AVAILABLE',
          status: slot.status,
          slotId: slot.slotId,
          originalSlot: slot
        }));
        setAvailableSlots(formattedSlots);
      } else {
        setAvailableSlots([]);
        console.log('No slots available or invalid response');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      Alert.alert('Error', 'Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    console.log('Date selected:', date);
    
    let dateString = date.dateString;
    
    if (!dateString && date.timestamp) {
      const dateObj = new Date(date.timestamp);
      dateString = dateObj.toISOString().split('T')[0];
    }
    
    if (!dateString) {
      dateString = new Date().toISOString().split('T')[0];
      console.log('Using fallback date:', dateString);
    }
    
    console.log('Final date string to use:', dateString);
    
    setSelectedDate(dateString);
    setSelectedSlots([]); // Reset selected slots when date changes
    fetchAvailableSlots(dateString);
  };

  // Toggle slot selection
  const toggleSlot = (slot) => {
    if (!slot.available) return;
    
    setSelectedSlots(prev => {
      const isSelected = prev.find(s => s.id === slot.id);
      if (isSelected) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        return [...prev, slot];
      }
    });
  };

  // Increase equipment quantity
  const increaseEquipmentQuantity = (equipmentId) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [equipmentId]: (prev[equipmentId] || 0) + 1
    }));
  };

  // Decrease equipment quantity
  const decreaseEquipmentQuantity = (equipmentId) => {
    setSelectedEquipment(prev => {
      const current = prev[equipmentId] || 0;
      if (current <= 1) {
        const newState = { ...prev };
        delete newState[equipmentId];
        return newState;
      }
      return { ...prev, [equipmentId]: current - 1 };
    });
  };

  // Calculate total duration and cost
  const calculateTotals = () => {
    const totalDuration = selectedSlots.length * 0.5; // 30 minutes per slot
    const courtCost = court ? court.pricePerHour * totalDuration : 0;
    
    let equipmentCost = 0;
    Object.entries(selectedEquipment).forEach(([equipmentId, quantity]) => {
      const equipmentItem = equipment.find(e => e.equipmentId == equipmentId);
      if (equipmentItem) {
        equipmentCost += equipmentItem.ratePerHour * quantity * totalDuration;
      }
    });
    
    const totalCost = courtCost + equipmentCost;
    
    return { totalDuration, courtCost, equipmentCost, totalCost };
  };

  // Get calculated totals
  const { totalDuration, courtCost, equipmentCost, totalCost } = calculateTotals();

  // Handle proceed to order summary
  const handleProceed = () => {
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to continue with your booking.");
      return;
    }

    if (selectedSlots.length === 0) {
      Alert.alert("No Slots Selected", "Please select at least one time slot to continue.");
      return;
    }

    // Prepare data for navigation
    const bookingData = {
      venueId,
      courtId,
      selectedDate,
      startTime: selectedSlots[0].startTime,
      endTime: selectedSlots[selectedSlots.length - 1].endTime,
      totalDuration,
      totalCost,
      courtName: court?.courtName || 'Unknown Court',
      venueName: venue?.name || 'Unknown Venue',
      selectedSlots: JSON.stringify(selectedSlots),
      selectedEquipment: JSON.stringify(selectedEquipment),
      customerId: user.userId
    };

    // Navigate to order summary
    router.push({
      pathname: "/booking/order-summary",
      params: bookingData
    });
  };

  // Handle go back
  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-gray-600">Loading...</Text>
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
          <Text className="text-xl font-bold text-white ml-4">Select Slots & Equipment</Text>
        </View>

        {/* Court and Venue Info */}
        <View className="p-4 bg-gray-50">
          <Text className="text-2xl font-bold text-gray-800">{court?.courtName}</Text>
          <Text className="text-lg text-gray-600">{venue?.name}</Text>
          <Text className="text-gray-600">Price: LKR {court?.pricePerHour}/hour</Text>
        </View>

        {/* Calendar */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-3">Select Date</Text>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#FF4B00' }
            }}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              selectedDayBackgroundColor: '#FF4B00',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#FF4B00',
              arrowColor: '#FF4B00',
            }}
            dateFormat="yyyy-MM-dd"
            current={selectedDate}
          />
        </View>

        {/* Available Slots */}
        {selectedDate && (
          <View className="p-4">
            <Text className="text-lg font-semibold mb-3">Available Time Slots</Text>
            {slotsLoading ? (
              <View className="py-8">
                <Text className="text-center text-gray-500">Loading slots...</Text>
              </View>
            ) : availableSlots.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlots.find(s => s.id === slot.id);
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => toggleSlot(slot)}
                      className={`px-4 py-3 rounded-lg border-2 ${
                        isSelected
                          ? "bg-orange-500 border-orange-500"
                          : slot.available
                          ? "bg-white border-gray-300"
                          : "bg-gray-200 border-gray-200"
                      }`}
                      disabled={!slot.available}
                    >
                      <Text
                        className={`font-medium ${
                          isSelected
                            ? "text-white"
                            : slot.available
                            ? "text-gray-800"
                            : "text-gray-500"
                        }`}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text className="text-gray-600 text-center py-4">
                No time slots available for {selectedDate}. Please select a different date.
              </Text>
            )}
          </View>
        )}

        {/* Equipment Selection */}
        {equipment.length > 0 && (
          <View className="p-4">
            <Text className="text-lg font-semibold mb-3">Available Equipment</Text>
            {equipmentLoading ? (
              <Text className="text-center text-gray-500">Loading equipment...</Text>
            ) : (
              <View className="space-y-4">
                {equipment.map((eq) => (
                  <View key={eq.equipmentId} className="bg-gray-50 p-4 rounded-lg">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="font-medium text-gray-800">{eq.name}</Text>
                      <Text className="text-sm text-gray-600">LKR {eq.ratePerHour}/hour</Text>
                    </View>
                    <Text className="text-sm text-gray-600 mb-3">{eq.description}</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">
                        Available: {eq.availableQuantity}/{eq.totalQuantity}
                      </Text>
                      <View className="flex-row items-center space-x-2">
                        <TouchableOpacity
                          onPress={() => decreaseEquipmentQuantity(eq.equipmentId)}
                          className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center"
                        >
                          <Text className="text-gray-700 font-bold">-</Text>
                        </TouchableOpacity>
                        <Text className="w-8 text-center font-medium">
                          {selectedEquipment[eq.equipmentId] || 0}
                        </Text>
                        <TouchableOpacity
                          onPress={() => increaseEquipmentQuantity(eq.equipmentId)}
                          disabled={!eq.availableQuantity || (selectedEquipment[eq.equipmentId] || 0) >= eq.availableQuantity}
                          className={`w-8 h-8 rounded-full items-center justify-center ${
                            !eq.availableQuantity || (selectedEquipment[eq.equipmentId] || 0) >= eq.availableQuantity
                              ? 'bg-gray-200'
                              : 'bg-orange-500'
                          }`}
                        >
                          <Text className={`font-bold ${
                            !eq.availableQuantity || (selectedEquipment[eq.equipmentId] || 0) >= eq.availableQuantity
                              ? 'text-gray-400'
                              : 'text-white'
                          }`}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Cost Summary */}
        <View className="p-4 bg-gray-50">
          <Text className="text-lg font-semibold mb-3">Cost Summary</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Court Cost:</Text>
              <Text className="font-medium">LKR {courtCost.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Equipment Cost:</Text>
              <Text className="font-medium">LKR {equipmentCost.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="font-semibold">Total Cost:</Text>
              <Text className="font-bold text-lg text-orange-600">LKR {totalCost.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Duration:</Text>
              <Text className="font-medium">{totalDuration} hours</Text>
            </View>
          </View>
        </View>

        {/* Proceed Button */}
        <View className="p-4">
          <TouchableOpacity
            onPress={handleProceed}
            disabled={selectedSlots.length === 0}
            className={`p-4 rounded-lg ${
              selectedSlots.length === 0
                ? 'bg-gray-300'
                : 'bg-orange-500'
            }`}
          >
            <Text className="text-center text-white font-semibold text-lg">
              {selectedSlots.length === 0
                ? "Select Time Slots to Continue"
                : "Proceed to Order Summary"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}