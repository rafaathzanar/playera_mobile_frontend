import React, { useState } from "react";
import { SafeAreaView, ScrollView, TouchableOpacity, Text } from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SlotSelection() {
  const router = useRouter();
  const { venueId, courtId } = useLocalSearchParams();
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("2025-03-24"); // Default date for demo

  // Sample slot data for demonstration.
  // In a real application, you would fetch available slots based on the selectedDate and courtId.
  const slots = [
    { time: "10:00 - 10:30", available: true },
    { time: "10:30 - 11:00", available: true },
    { time: "11:00 - 11:30", available: false },
    { time: "11:30 - 12:00", available: true },
  ];

  const toggleSlot = (time) => {
    setSelectedSlots((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  };

  const handleProceed = () => {
    // Pass selected date and slots via query parameters (JSON-stringify and encode)
    router.push(
      `/booking/order-summary?venueId=${venueId}&courtId=${courtId}&date=${selectedDate}&slots=${encodeURIComponent(
        JSON.stringify(selectedSlots)
      )}`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-4">Select Booking Date & Slots</Text>
        
        {/* Interactive Calendar */}
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: "orange" },
          }}
          theme={{
            backgroundColor: "white",
            calendarBackground: "white",
            textSectionTitleColor: "#000",
            dayTextColor: "#000",
            arrowColor: "orange",
            todayTextColor: "orange",
          }}
          style={{ marginBottom: 16, borderRadius: 8, elevation: 2 }}
        />

        {/* Time Slots List */}
        {slots.map((slot) => (
          <TouchableOpacity
            key={slot.time}
            onPress={() => slot.available && toggleSlot(slot.time)}
            className={`p-4 mb-2 border rounded ${
              selectedSlots.includes(slot.time) ? "bg-orange-500" : "bg-gray-200"
            } ${!slot.available ? "opacity-50" : ""}`}
          >
            <Text className={`${selectedSlots.includes(slot.time) ? "text-white" : "text-black"}`}>
              {slot.time} {slot.available ? "" : "(Booked)"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={handleProceed}
        className="p-4 bg-orange-500 m-4 rounded"
      >
        <Text className="text-white text-center font-bold">
          Confirm & Proceed
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
