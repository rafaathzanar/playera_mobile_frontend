import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("");

  // Sample bookings
  const bookings = [
    {
      id: "1",
      date: "2025-03-24",
      venue: "CRICKET INDOOR",
      address: "70, Akurana Road, Kandy",
      contact: "0779694278",
      image: "https://www.blenheimindoorsports.co.nz/assets/Matts-Photos/507ae5df5b/IndoorCricket1__ResizedImageWzY1MSw0MzVd.jpg",
      timeSlot: "3:00 PM - 4:00 PM",
      status: "booked", // booked, pending, or canceled
    },
    {
      id: "2",
      date: "2025-03-25",
      venue: "FOOTBALL FIELD",
      address: "123, Kandy Road, Colombo",
      contact: "0771234567",
      image: "https://images.theconversation.com/files/618058/original/file-20240909-16-tj4qv8.jpg?ixlib=rb-4.1.0&rect=49%2C523%2C3478%2C1739&q=45&auto=format&w=1356&h=668&fit=crop",
      timeSlot: "10:00 AM - 11:00 AM",
      status: "pending", // booked, pending, or canceled
    },
  ];

  // Dynamically generate markedDates from the bookings
  const markedDates = bookings.reduce((acc, booking) => {
    const color = booking.status === "booked" 
      ? "green" 
      : booking.status === "pending" 
      ? "yellow" 
      : "red";
    acc[booking.date] = { marked: true, dotColor: color };
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
        <Text className="text-2xl font-bold ml-5 mb-2">Your Booking Calendar</Text>
      {/* Calendar */}
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: "black",
          calendarBackground: "black",
          textSectionTitleColor: "white",
          dayTextColor: "white",
          arrowColor: "white",
          selectedDayBackgroundColor: "orange",
          selectedDayTextColor: "black",
          todayTextColor: "orange",
        }}
        style={styles.calendar}
      />

      {/* Booking Legends */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "green" }]} />
          <Text>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "yellow" }]} />
          <Text>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "red" }]} />
          <Text>Canceled</Text>
        </View>
      </View>

      {/* Booking Details */}
      <Text style={styles.title}>
        {selectedDate ? `Bookings on ${selectedDate}` : "Select a date"}
      </Text>

      <FlatList className="mb-20"
        data={bookings.filter((b) => b.date === selectedDate)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.venue}>{item.venue}</Text>
            <Text style={styles.address}>{item.address}</Text>
            <Text style={styles.timeSlot}>Time Slot: {item.timeSlot}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "white", 
    padding: 20,  
  },
  calendar: { 
    margin:20,
    marginTop:-4,
    marginBottom:-5,
    padding: 10,   
    borderRadius: 8, 
    elevation: 2, 
  },
  legendContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginVertical: 10, 
    paddingHorizontal: 10, 
  },
  legendItem: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  dot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginRight: 5 
  },
  title: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginVertical: 10, 
    paddingHorizontal: 10,
  },
  card: { 
    backgroundColor: "white", 
    padding: 10, 
    borderRadius: 10, 
    marginBottom: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    paddingHorizontal: 10,
  },
  image: { 
    width: "100%", 
    height: 120, 
    borderRadius: 10 
  },
  venue: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginTop: 5 
  },
  address: { 
    color: "gray" 
  },
  timeSlot: { 
    fontSize: 14, 
    color: "#FF4500" 
  },
});