// import React, { useState } from "react";
// import { SafeAreaView, ScrollView, TouchableOpacity, Text } from "react-native";
// import { Calendar } from "react-native-calendars";
// import { useLocalSearchParams, useRouter } from "expo-router";

// export default function SlotSelection() {
//   const router = useRouter();
//   const { venueId, courtId } = useLocalSearchParams();
//   const [selectedSlots, setSelectedSlots] = useState([]);
//   const [selectedDate, setSelectedDate] = useState("2025-03-24"); // Default date for demo

//   // Sample slot data for demonstration.
//   // In a real application, you would fetch available slots based on the selectedDate and courtId.
//   const slots = [
//     { time: "10:00 - 10:30", available: true },
//     { time: "10:30 - 11:00", available: true },
//     { time: "11:00 - 11:30", available: false },
//     { time: "11:30 - 12:00", available: true },
//   ];

//   const toggleSlot = (time) => {
//     setSelectedSlots((prev) =>
//       prev.includes(time)
//         ? prev.filter((t) => t !== time)
//         : [...prev, time]
//     );
//   };

//   const handleProceed = () => {
//     // Pass selected date and slots via query parameters (JSON-stringify and encode)
//     router.push(
//       `/booking/order-summary?venueId=${venueId}&courtId=${courtId}&date=${selectedDate}&slots=${encodeURIComponent(
//         JSON.stringify(selectedSlots)
//       )}`
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView className="p-4">
//         <Text className="text-2xl font-bold mb-4">Select Booking Date & Slots</Text>
        
//         {/* Interactive Calendar */}
//         <Calendar
//           current={selectedDate}
//           onDayPress={(day) => setSelectedDate(day.dateString)}
//           markedDates={{
//             [selectedDate]: { selected: true, selectedColor: "#FF4B00" },
//           }}
//           theme={{
//             backgroundColor: "white",
//             calendarBackground: "white",
//             textSectionTitleColor: "#000",
//             dayTextColor: "#000",
//             arrowColor: "#FF4B00",
//             todayTextColor: "#FF4B00",
//           }}
//           style={{ marginBottom: 16, borderRadius: 8, elevation: 2 }}
//         />

//         {/* Time Slots List */}
//         {slots.map((slot) => (
//           <TouchableOpacity
//             key={slot.time}
//             onPress={() => slot.available && toggleSlot(slot.time)}
//             className={`p-4 mb-2 border rounded ${
//               selectedSlots.includes(slot.time) ? "bg-secondary" : "bg-gray-200"
//             } ${!slot.available ? "opacity-50" : ""}`}
//           >
//             <Text className={`${selectedSlots.includes(slot.time) ? "text-white" : "text-black"}`}>
//               {slot.time} {slot.available ? "" : "(Booked)"}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       <TouchableOpacity
//         onPress={handleProceed}
//         className="bg-secondary mt-6 p-3 rounded-[20px] mr-4 ml-4"
//       >
//         <Text className="text-white text-center font-bold">
//           Confirm & Proceed
//         </Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

import React, { useState } from "react";
import { SafeAreaView, ScrollView, TouchableOpacity, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

export default function SlotSelection() {
  const router = useRouter();
  const { venueId, courtId } = useLocalSearchParams();
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("2025-02-02"); // Match image date
 const navigation = useNavigation('/venue/court/[courtId]'); // Get navigation object
  // Slots based on the image
  const slots = [
    { time: "10:00 PM - 10:30 PM", available: true },
    { time: "10:30 PM - 11:00 PM", available: true },
    { time: "11:00 PM - 11:30 PM", available: true },
  ];

  const toggleSlot = (time) => {
    setSelectedSlots((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  };

  const handleProceed = () => {
    router.push(
      `/booking/order-summary?venueId=${venueId}&courtId=${courtId}&date=${selectedDate}&slots=${encodeURIComponent(
        JSON.stringify(selectedSlots)
      )}`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View>
                <View className="flex-row items-center  p-2" style={{ backgroundColor: '#FF4B00' }}>
                   <TouchableOpacity onPress={() => navigation.goBack()} className="pr-1">
                                          <ArrowLeftIcon size={20} color="white" style={{ marginLeft: 15 }} />
                                        </TouchableOpacity>
                  <Text className="font-bold text-lg text-white text-center flex-1">
                 INDOOR COURTS
                  </Text>
      
                  {/* Spacer to balance the layout since text is centered */}
                  <View style={{ width: 24 }} />
                </View>
              </View>
      <ScrollView className="p-4">
        {/* Header */}
        
          {/* <Text className="font-bold text-lg black text-center p-3">INDOOR COURTS</Text> */}
        <Text className="text-lg text-orange-500 mb-4">{selectedDate}</Text>

        {/* Interactive Calendar */}
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
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
        />

        {/* Time Slots List */}
        {slots.map((slot) => (
          <View key={slot.time} className="flex-row justify-between items-center p-3 mb-2   bg-white">
          <Text style={{ color: '#FF4B00' }}>{slot.time}</Text>

            <TouchableOpacity
              onPress={() => slot.available && toggleSlot(slot.time)}
              className={`px-10 py-2 rounded-[5px]  ${
                selectedSlots.includes(slot.time) ? "bg-orange-500" : "bg-gray-200"
              }`}
              disabled={!slot.available}
            >
              <Text className={`${selectedSlots.includes(slot.time) ? "text-white" : "text-black"} font-light`}>
                Available
              </Text>
            </TouchableOpacity>

            
          </View>
          
        ))}
        <TouchableOpacity
        onPress={handleProceed}
        className="bg-secondary mt-6 p-3 rounded-[5px] mr-3 ml-3"
      >
        <Text className="text-white text-center font-bold">Confirm and Checkout</Text>
      </TouchableOpacity>
      </ScrollView>

      
    </SafeAreaView>
  );
}