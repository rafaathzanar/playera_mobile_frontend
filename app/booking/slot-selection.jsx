import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { getCurrentDateUTC, formatDateUTC, debugDate } from "../../utils/dateUtils";
import { AvailabilityService } from "../../services/availabilityService";

export default function SlotSelection() {
  const { venueId, courtId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [selectedDate, setSelectedDate] = useState(getCurrentDateUTC());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [court, setCourt] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  // Enhanced state for availability checking and reservations
  const [availabilityService] = useState(() => new AvailabilityService());
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [slotReservations, setSlotReservations] = useState(new Map());
  const [reservationTimers, setReservationTimers] = useState(new Map());

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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cancel all active reservations
      slotReservations.forEach(async (reservation, key) => {
        try {
          await availabilityService.cancelReservation(reservation.reservationId);
        } catch (error) {
          console.error("Error cancelling reservation on unmount:", error);
        }
      });
      
      // Clear all timers
      reservationTimers.forEach(timer => clearInterval(timer));
      
      // Cleanup availability service
      availabilityService.cleanup();
    };
  }, []);

  // Fetch available equipment
  const fetchEquipment = async () => {
    try {
      setEquipmentLoading(true);
      console.log("Fetching equipment for courtId:", courtId);
      const equipmentData = await api.getEquipment(courtId);
      console.log("Equipment data received:", equipmentData);
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
      console.log('=== BACKEND SLOTS DEBUG ===');
      console.log('Available slots from API:', availableSlots);
      if (availableSlots && availableSlots.length > 0) {
        console.log('First few slots with pricing:');
        availableSlots.slice(0, 3).forEach((slot, index) => {
          console.log(`Slot ${index + 1}:`, {
            startTime: slot.startTime,
            endTime: slot.endTime,
            time: `${slot.startTime} - ${slot.endTime}`,
            pricePerHour: slot.pricePerHour,
            status: slot.status
          });
        });
      }
      console.log('=== END BACKEND SLOTS DEBUG ===');
      
      if (availableSlots && Array.isArray(availableSlots)) {
        // Show all slots (both available and booked) but mark availability
        const formattedSlots = availableSlots.map(slot => ({
          id: `${slot.courtId}-${slot.date}-${slot.startTime}`,
          time: `${slot.startTime} - ${slot.endTime}`,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: slot.status === 'AVAILABLE', // Mark availability based on status
          status: slot.status,
          slotId: slot.slotId,
          pricePerHour: slot.pricePerHour, // IMPORTANT: Preserve dynamic pricing from API
          originalSlot: slot
        }));
        
        console.log(`Showing ${formattedSlots.length} total slots (${formattedSlots.filter(s => s.available).length} available, ${formattedSlots.filter(s => !s.available).length} booked)`);
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
      dateString = formatDateUTC(dateObj);
    }
    
    if (!dateString) {
      dateString = getCurrentDateUTC();
      console.log('Using fallback date:', dateString);
    }
    
    // Ensure the date is in UTC format
    dateString = formatDateUTC(dateString);
    
    debugDate('Date Selection', dateString);
    
    setSelectedDate(dateString);
    setSelectedSlots([]); // Reset selected slots when date changes
    fetchAvailableSlots(dateString);
  };

  // Group selected slots by time ranges (consecutive vs discontinuous)
  const groupSlotsByTimeRanges = (slots) => {
    if (!slots || slots.length === 0) return [];
    
    const sortedSlots = [...slots].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
    
    const ranges = [];
    let currentRange = null;
    
    sortedSlots.forEach(slot => {
      if (!currentRange) {
        currentRange = {
          startTime: slot.startTime,
          endTime: slot.endTime,
          slots: [slot],
          duration: 0.5 // Assuming 30-minute slots
        };
      } else if (slot.startTime === currentRange.endTime) {
        // Consecutive slot - extend current range
        currentRange.endTime = slot.endTime;
        currentRange.slots.push(slot);
        currentRange.duration += 0.5;
      } else {
        // Non-consecutive slot - start new range
        ranges.push(currentRange);
        currentRange = {
          startTime: slot.startTime,
          endTime: slot.endTime,
          slots: [slot],
          duration: 0.5
        };
      }
    });
    
    if (currentRange) {
      ranges.push(currentRange);
    }
    
    return ranges;
  };

  // Enhanced slot selection with real-time availability checking
  const toggleSlot = async (slot) => {
    // Don't allow interaction with booked slots
    if (!slot.available) {
      Alert.alert(
        "Slot Not Available",
        "This time slot has already been booked by another user.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Check if slot is already reserved by this user
    const reservationKey = `${courtId}-${selectedDate}-${slot.startTime}-${slot.endTime}`;
    const existingReservation = slotReservations.get(reservationKey);
    
    if (existingReservation) {
      // Cancel existing reservation
      await cancelSlotReservation(slot);
      return;
    }
    
    // Try enhanced availability checking first, fallback to original behavior
    setCheckingAvailability(true);
    try {
      const availability = await availabilityService.checkAvailability(
        courtId,
        selectedDate,
        slot.startTime,
        slot.endTime,
        user?.userId
      );
      
      // If availability service is working and slot is not available
      if (availability && !availability.available && !availability.fallback) {
        Alert.alert(
          "Slot No Longer Available",
          "This time slot has been booked by another user. Please select a different slot.",
          [{ text: "OK" }]
        );
        
        // Refresh available slots
        await fetchAvailableSlots(selectedDate);
        return;
      }
      
      // If availability service returned fallback, skip reservation attempt
      if (availability && availability.fallback) {
        console.log("Availability service returned fallback, skipping reservation attempt");
        // Fall through to original behavior
      } else {
      
      // Try to reserve the slot temporarily
      const reservation = await availabilityService.reserveTimeSlot(
        courtId,
        selectedDate,
        slot.startTime,
        slot.endTime,
        user?.userId
      );
      
      if (reservation && reservation.success) {
        // Add to selected slots
        setSelectedSlots(prev => [...prev, slot]);
        
        // Store reservation info
        setSlotReservations(prev => {
          const newMap = new Map(prev);
          newMap.set(reservationKey, {
            reservationId: reservation.reservationId,
            expiresAt: new Date(reservation.expiresAt),
            slot: slot
          });
          return newMap;
        });
        
        // Start countdown timer
        startReservationTimer(reservationKey, reservation.expiresAt);
        
        Alert.alert(
          "Slot Reserved",
          `Time slot ${slot.time} has been reserved for 5 minutes. Complete your booking before it expires.`,
          [{ text: "OK" }]
        );
        return;
      }
      
      // If reservation failed or returned fallback, fall through to original behavior
      if (reservation && reservation.fallback) {
        console.log("Reservation service returned fallback, using original slot selection");
      } else {
        console.log("Reservation service not available, using original slot selection");
      }
      
      } // Close the else block for availability.fallback check
      
    } catch (error) {
      console.error("Error with availability service:", error);
      console.log("Falling back to original slot selection behavior");
    } finally {
      setCheckingAvailability(false);
    }
    
    // Fallback to original slot selection behavior
    const wasSelected = selectedSlots.find(s => s.id === slot.id);
    setSelectedSlots(prev => {
      const isSelected = prev.find(s => s.id === slot.id);
      if (isSelected) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        return [...prev, slot];
      }
    });
    
    // Show appropriate message based on action
    if (wasSelected) {
      Alert.alert(
        "Slot Unselected",
        `Time slot ${slot.time} has been unselected.`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Slot Selected",
        `Time slot ${slot.time} has been selected.`,
        [{ text: "OK" }]
      );
    }
  };

  // Cancel slot reservation
  const cancelSlotReservation = async (slot) => {
    const reservationKey = `${courtId}-${selectedDate}-${slot.startTime}-${slot.endTime}`;
    const reservation = slotReservations.get(reservationKey);
    
    if (reservation) {
      try {
        await availabilityService.cancelReservation(reservation.reservationId);
        
        // Remove from selected slots
        setSelectedSlots(prev => prev.filter(s => s.id !== slot.id));
        
        // Remove reservation
        setSlotReservations(prev => {
          const newMap = new Map(prev);
          newMap.delete(reservationKey);
          return newMap;
        });
        
        // Clear timer
        clearReservationTimer(reservationKey);
        
        Alert.alert(
          "Reservation Cancelled",
          `Time slot ${slot.time} reservation has been cancelled.`,
          [{ text: "OK" }]
        );
        
      } catch (error) {
        console.error("Error cancelling reservation:", error);
      }
    }
  };

  // Start reservation countdown timer
  const startReservationTimer = (reservationKey, expiresAt) => {
    const timer = setInterval(() => {
      const now = new Date();
      const expirationTime = new Date(expiresAt);
      
      if (now >= expirationTime) {
        // Reservation expired
        clearInterval(timer);
        handleReservationExpired(reservationKey);
      }
    }, 1000); // Check every second
    
    setReservationTimers(prev => {
      const newMap = new Map(prev);
      newMap.set(reservationKey, timer);
      return newMap;
    });
  };

  // Clear reservation timer
  const clearReservationTimer = (reservationKey) => {
    const timer = reservationTimers.get(reservationKey);
    if (timer) {
      clearInterval(timer);
      setReservationTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(reservationKey);
        return newMap;
      });
    }
  };

  // Handle reservation expiration
  const handleReservationExpired = (reservationKey) => {
    const reservation = slotReservations.get(reservationKey);
    if (reservation) {
      // Remove from selected slots
      setSelectedSlots(prev => prev.filter(s => s.id !== reservation.slot.id));
      
      // Remove reservation
      setSlotReservations(prev => {
        const newMap = new Map(prev);
        newMap.delete(reservationKey);
        return newMap;
      });
      
      // Show expiration alert
      Alert.alert(
        "Reservation Expired",
        "Your time slot reservation has expired. Please select a new slot.",
        [{ text: "OK" }]
      );
      
      // Refresh available slots
      fetchAvailableSlots(selectedDate);
    }
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
    
    // Calculate court cost using dynamic pricing from individual slots
    let courtCost = 0;
    if (selectedSlots.length > 0) {
      console.log('=== DYNAMIC PRICING CALCULATION DEBUG ===');
      console.log('Selected slots:', selectedSlots.length);
      console.log('Court base price:', court?.pricePerHour);
      
      // Each slot has its own dynamic price from the API
      courtCost = selectedSlots.reduce((total, slot) => {
        // Use the dynamic price from the slot if available, otherwise fallback to court base price
        const slotPrice = slot.pricePerHour || court?.pricePerHour || 0;
        const slotCost = slotPrice * 0.5; // 0.5 hours per slot
        
        console.log(`Slot ${slot.time}:`, {
          slotPrice: slotPrice,
          slotCost: slotCost,
          hasDynamicPrice: !!slot.pricePerHour
        });
        
        return total + slotCost;
      }, 0);
      
      console.log('Total court cost:', courtCost);
      console.log('=== END DYNAMIC PRICING DEBUG ===');
    }
    
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

  // Handle proceed to order summary
  const handleProceed = () => {
    if (selectedSlots.length === 0) {
      Alert.alert("No Slots Selected", "Please select at least one time slot.");
      return;
    }

    const { totalDuration, totalCost } = calculateTotals();
    
    // Check minimum booking duration requirement
    if (court && court.minBookingDuration && totalDuration < court.minBookingDuration) {
      const minHours = court.minBookingDuration;
      const minSlots = Math.ceil(minHours * 2); // Assuming 30-minute slots
      Alert.alert(
        "Minimum Booking Duration Required",
        `You need to book at least ${minHours} hour${minHours > 1 ? 's' : ''} (${minSlots} slot${minSlots > 1 ? 's' : ''}) for ${court.courtName}. Please select more time slots.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Check maximum booking duration requirement
    if (court && court.maxBookingDuration && totalDuration > court.maxBookingDuration) {
      const maxHours = court.maxBookingDuration;
      const maxSlots = Math.floor(maxHours * 2); // Assuming 30-minute slots
      Alert.alert(
        "Maximum Booking Duration Exceeded",
        `You can book a maximum of ${maxHours} hour${maxHours > 1 ? 's' : ''} (${maxSlots} slot${maxSlots > 1 ? 's' : ''}) for ${court.courtName}. Please reduce your selection.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Prepare equipment data for next page
    const selectedEquipmentData = Object.entries(selectedEquipment).map(([equipmentId, quantity]) => {
      const equipmentItem = equipment.find(e => e.equipmentId == equipmentId);
      if (!equipmentItem) {
        console.error('Equipment not found for ID:', equipmentId);
        return null;
      }
      return {
        id: equipmentItem.equipmentId,
        name: equipmentItem.name,
        quantity: quantity,
        ratePerHour: equipmentItem.ratePerHour,
        totalCost: equipmentItem.ratePerHour * quantity * totalDuration
      };
    }).filter(item => item !== null);

    // Prepare slot data for booking
    const slotData = selectedSlots.map(slot => ({
      slotId: slot.slotId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      date: selectedDate
    }));

    // Prepare time slot ranges for discontinuous booking
    const timeSlotRanges = groupSlotsByTimeRanges(selectedSlots).map(range => ({
      startTime: range.startTime,
      endTime: range.endTime,
      duration: range.duration
    }));

    // Debug logging
    console.log('=== SLOT SELECTION DEBUG ===');
    console.log('Selected slots:', selectedSlots);
    console.log('Grouped ranges:', groupSlotsByTimeRanges(selectedSlots));
    console.log('Time slot ranges to pass:', timeSlotRanges);
    console.log('startTime (first slot):', selectedSlots[0].startTime);
    console.log('endTime (last slot):', selectedSlots[selectedSlots.length - 1].endTime);
    
    // Debug individual time values
    if (timeSlotRanges.length > 0) {
      console.log('First range startTime:', timeSlotRanges[0].startTime, 'Type:', typeof timeSlotRanges[0].startTime);
      console.log('First range endTime:', timeSlotRanges[0].endTime, 'Type:', typeof timeSlotRanges[0].endTime);
    }
    console.log('=== END DEBUG ===');

    router.push({
      pathname: "/booking/order-summary",
      params: {
        venueId,
        courtId,
        selectedDate,
        startTime: timeSlotRanges.length > 0 ? timeSlotRanges[0].startTime : selectedSlots[0].startTime,
        endTime: timeSlotRanges.length > 0 ? timeSlotRanges[0].endTime : selectedSlots[selectedSlots.length - 1].endTime,
        totalDuration,
        totalCost,
        courtCost, // Pass court cost separately
        equipmentCost, // Pass equipment cost separately
        courtName: court?.courtName,
        venueName: venue?.name,
        selectedSlots: JSON.stringify(slotData),
        timeSlotRanges: JSON.stringify(timeSlotRanges), // NEW: Pass time slot ranges
        selectedEquipment: JSON.stringify(selectedEquipmentData),
        customerId: user?.userId
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  const { totalDuration, courtCost, equipmentCost, totalCost } = calculateTotals();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center p-4 bg-orange-500">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftIcon size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-4">Select Slots & Equipment</Text>
        </View>

        {/* Court and Venue Info */}
        <View className="p-4 bg-gray-50">
          <Text className="text-2xl font-bold text-gray-800">{court?.courtName}</Text>
          <Text className="text-lg text-gray-600">{venue?.name}</Text>
          <Text className="text-gray-600">Price: LKR {court?.pricePerHour}/hour</Text>
          
          {/* Booking Requirements */}
          {court && (court.minBookingDuration || court.maxBookingDuration) && (
            <View className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Text className="text-sm font-semibold text-blue-800 mb-1">Booking Requirements:</Text>
              {court.minBookingDuration && (
                <Text className="text-sm text-blue-700">
                  • Minimum: {court.minBookingDuration} hour{court.minBookingDuration > 1 ? 's' : ''}
                </Text>
              )}
              {court.maxBookingDuration && (
                <Text className="text-sm text-blue-700">
                  • Maximum: {court.maxBookingDuration} hour{court.maxBookingDuration > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Calendar */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-3">Select Date</Text>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#FF4B00' }
            }}
            minDate={getCurrentDateUTC()}
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
            <Text className="text-lg font-semibold mb-3">Time Slots</Text>
            {slotsLoading ? (
              <View className="py-8">
                <Text className="text-center text-gray-500">Loading slots...</Text>
              </View>
            ) : availableSlots.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {availableSlots.map((slot) => {
                  const reservationKey = `${courtId}-${selectedDate}-${slot.startTime}-${slot.endTime}`;
                  const reservation = slotReservations.get(reservationKey);
                  const isSelected = selectedSlots.find(s => s.id === slot.id);
                  const isReservedByUser = reservation && reservation.expiresAt > new Date();
                  
                  let slotStatus = "Available";
                  let slotStyle = "border-green-300 bg-green-50";
                  let textStyle = "text-green-800";
                  
                  if (!slot.available) {
                    slotStatus = "Booked";
                    slotStyle = "border-gray-300 bg-gray-100 opacity-50";
                    textStyle = "text-gray-500";
                  } else if (isReservedByUser) {
                    slotStatus = "Reserved by you";
                    slotStyle = "border-orange-500 bg-orange-100";
                    textStyle = "text-orange-800";
                  } else if (isSelected) {
                    slotStatus = "Selected";
                    slotStyle = "border-blue-500 bg-blue-100";
                    textStyle = "text-blue-800";
                  } else {
                    slotStatus = "Available";
                    slotStyle = "border-green-300 bg-green-50";
                    textStyle = "text-green-800";
                  }

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => toggleSlot(slot)}
                      className={`p-3 rounded-lg border-2 ${slotStyle}`}
                      disabled={!slot.available || checkingAvailability}
                    >
                      <Text className={`text-sm font-medium ${textStyle}`}>
                        {slot.time}
                      </Text>
                      <Text className={`text-xs ${textStyle}`}>
                        {slotStatus}
                      </Text>
                      {isReservedByUser && (
                        <Text className="text-xs text-orange-600 mt-1">
                          Expires: {reservation.expiresAt.toLocaleTimeString()}
                        </Text>
                      )}
                      {checkingAvailability && (
                        <ActivityIndicator size="small" color="#f97316" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className="py-8">
                <Text className="text-center text-gray-500">No slots available for this date</Text>
              </View>
            )}
          </View>
        )}

        {/* Selected Time Ranges Display */}
        {selectedSlots.length > 0 && (
          <View className="p-4 bg-blue-50 rounded-lg mx-4 mb-4">
            <Text className="text-lg font-semibold text-blue-800 mb-3">Selected Time Ranges</Text>
            {groupSlotsByTimeRanges(selectedSlots).map((range, index) => (
              <View key={index} className="bg-white p-3 rounded-lg mb-2 border border-blue-200">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-medium text-gray-800">
                      Range {index + 1}: {range.startTime} - {range.endTime}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {range.slots.length} slot{range.slots.length > 1 ? 's' : ''} • {range.duration} hour{range.duration > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View className="bg-blue-100 px-2 py-1 rounded">
                    <Text className="text-xs text-blue-700 font-medium">
                      {range.slots.length === 1 ? 'Single' : 'Consecutive'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {groupSlotsByTimeRanges(selectedSlots).length > 1 && (
              <View className="mt-2 p-2 bg-yellow-100 rounded">
                <Text className="text-sm text-yellow-800 text-center">
                  📅 Multiple time ranges selected - Discontinuous booking
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Active Reservations Status */}
        {slotReservations.size > 0 && (
          <View className="p-4 bg-yellow-50 mx-4 rounded-lg mb-4">
            <Text className="text-lg font-semibold text-yellow-800 mb-2">
              Active Reservations
            </Text>
            {Array.from(slotReservations.entries()).map(([key, reservation]) => (
              <View key={key} className="bg-white p-3 rounded-lg mb-2 border border-yellow-200">
                <Text className="font-medium text-gray-800">
                  {reservation.slot.time}
                </Text>
                <Text className="text-sm text-gray-600">
                  Expires: {reservation.expiresAt.toLocaleTimeString()}
                </Text>
                <TouchableOpacity
                  onPress={() => cancelSlotReservation(reservation.slot)}
                  className="mt-2 bg-red-500 px-3 py-1 rounded"
                >
                  <Text className="text-white text-sm">Cancel Reservation</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View className="mt-2 p-2 bg-orange-100 rounded">
              <Text className="text-sm text-orange-800 text-center">
                ⏰ Complete your booking before reservations expire!
              </Text>
            </View>
          </View>
        )}

        {/* Equipment Selection */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-3">Available Equipment</Text>
          {equipmentLoading ? (
            <Text className="text-center text-gray-500">Loading equipment...</Text>
          ) : equipment.length > 0 ? (
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
            ) : (
              <Text className="text-center text-gray-500 py-4">
                No equipment available for this court
              </Text>
            )}
          </View>

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

        {/* Selection Status */}
        {court && (court.minBookingDuration || court.maxBookingDuration) && (
          <View className="px-4 pb-2">
            {(() => {
              const { totalDuration } = calculateTotals();
              const meetsMinimum = !court.minBookingDuration || totalDuration >= court.minBookingDuration;
              const withinMaximum = !court.maxBookingDuration || totalDuration <= court.maxBookingDuration;
              const isValidSelection = meetsMinimum && withinMaximum;
              
              return (
                <View className={`p-3 rounded-lg border ${
                  isValidSelection 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <Text className={`text-sm font-medium ${
                    isValidSelection ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {isValidSelection ? '✓ Selection Valid' : '⚠ Selection Requirements'}
                  </Text>
                  {!meetsMinimum && (
                    <Text className="text-xs text-yellow-700 mt-1">
                      Need at least {court.minBookingDuration} hour{court.minBookingDuration > 1 ? 's' : ''} (currently {totalDuration.toFixed(1)} hours)
                    </Text>
                  )}
                  {!withinMaximum && (
                    <Text className="text-xs text-yellow-700 mt-1">
                      Maximum {court.maxBookingDuration} hour{court.maxBookingDuration > 1 ? 's' : ''} allowed (currently {totalDuration.toFixed(1)} hours)
                    </Text>
                  )}
                </View>
              );
            })()}
          </View>
        )}

        {/* Proceed Button */}
        <View className="p-4">
          {(() => {
            const { totalDuration } = calculateTotals();
            const meetsMinimum = !court?.minBookingDuration || totalDuration >= court.minBookingDuration;
            const withinMaximum = !court?.maxBookingDuration || totalDuration <= court.maxBookingDuration;
            const isValidSelection = meetsMinimum && withinMaximum;
            const isDisabled = selectedSlots.length === 0 || !isValidSelection;
            
            return (
              <TouchableOpacity
                onPress={handleProceed}
                disabled={isDisabled}
                className={`p-4 rounded-lg ${
                  isDisabled
                    ? 'bg-gray-300'
                    : 'bg-orange-500'
                }`}
              >
                <Text className={`text-center font-semibold text-lg ${
                  isDisabled ? 'text-gray-500' : 'text-white'
                }`}>
                  {selectedSlots.length === 0 
                    ? 'Select Time Slots' 
                    : !isValidSelection 
                      ? 'Complete Selection Requirements'
                      : 'Proceed to Order Summary'
                  }
                </Text>
              </TouchableOpacity>
            );
          })()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
