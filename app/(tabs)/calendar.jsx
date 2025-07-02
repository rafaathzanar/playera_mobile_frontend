// import React, { useState } from "react";
// import { SafeAreaView, View, Text, FlatList, Image, StyleSheet } from "react-native";
// import { Calendar } from "react-native-calendars";

// export default function CalendarScreen() {
//   const [selectedDate, setSelectedDate] = useState("");

//   // Sample bookings
//   const bookings = [
//     {
//       id: "1",
//       date: "2025-03-24",
//       venue: "CRICKET INDOOR",
//       address: "70, Akurana Road, Kandy",
//       contact: "0779694278",
//       image: "https://www.blenheimindoorsports.co.nz/assets/Matts-Photos/507ae5df5b/IndoorCricket1__ResizedImageWzY1MSw0MzVd.jpg",
//       timeSlot: "3:00 PM - 4:00 PM",
//       status: "booked", // booked, pending, or canceled
//     },
//     {
//       id: "2",
//       date: "2025-03-25",
//       venue: "FOOTBALL FIELD",
//       address: "123, Kandy Road, Colombo",
//       contact: "0771234567",
//       image: "https://images.theconversation.com/files/618058/original/file-20240909-16-tj4qv8.jpg?ixlib=rb-4.1.0&rect=49%2C523%2C3478%2C1739&q=45&auto=format&w=1356&h=668&fit=crop",
//       timeSlot: "10:00 AM - 11:00 AM",
//       status: "pending", // booked, pending, or canceled
//     },
//   ];

//   // Dynamically generate markedDates from the bookings
//   const markedDates = bookings.reduce((acc, booking) => {
//     const color = booking.status === "booked" 
//       ? "green" 
//       : booking.status === "pending" 
//       ? "yellow" 
//       : "red";
//     acc[booking.date] = { marked: true, dotColor: color };
//     return acc;
//   }, {});

//   return (
//     <SafeAreaView style={styles.container}>
//         <Text className="text-2xl font-bold ml-5 mb-2">Your Booking Calendar</Text>
//       {/* Calendar */}
//       <Calendar
//         markedDates={markedDates}
//         onDayPress={(day) => setSelectedDate(day.dateString)}
//         theme={{
//           backgroundColor: "black",
//           calendarBackground: "black",
//           textSectionTitleColor: "white",
//           dayTextColor: "white",
//           arrowColor: "white",
//           selectedDayBackgroundColor: "orange",
//           selectedDayTextColor: "black",
//           todayTextColor: "orange",
//         }}
//         style={styles.calendar}
//       />

//       {/* Booking Legends */}
//       <View style={styles.legendContainer}>
//         <View style={styles.legendItem}>
//           <View style={[styles.dot, { backgroundColor: "green" }]} />
//           <Text>Booked</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.dot, { backgroundColor: "yellow" }]} />
//           <Text>Pending</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.dot, { backgroundColor: "red" }]} />
//           <Text>Canceled</Text>
//         </View>
//       </View>

//       {/* Booking Details */}
//       <Text style={styles.title}>
//         {selectedDate ? `Bookings on ${selectedDate}` : "Select a date"}
//       </Text>

//       <FlatList className="mb-20"
//         data={bookings.filter((b) => b.date === selectedDate)}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.card}>
//             <Image source={{ uri: item.image }} style={styles.image} />
//             <Text style={styles.venue}>{item.venue}</Text>
//             <Text style={styles.address}>{item.address}</Text>
//             <Text style={styles.timeSlot}>Time Slot: {item.timeSlot}</Text>
//           </View>
//         )}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: "white", 
//     padding: 20,  
//   },
//   calendar: { 
//     margin:20,
//     marginTop:-4,
//     marginBottom:-5,
//     padding: 10,   
//     borderRadius: 8, 
//     elevation: 2, 
//   },
//   legendContainer: { 
//     flexDirection: "row", 
//     justifyContent: "space-between", 
//     marginVertical: 10, 
//     paddingHorizontal: 10, 
//   },
//   legendItem: { 
//     flexDirection: "row", 
//     alignItems: "center" 
//   },
//   dot: { 
//     width: 12, 
//     height: 12, 
//     borderRadius: 6, 
//     marginRight: 5 
//   },
//   title: { 
//     fontSize: 18, 
//     fontWeight: "bold", 
//     marginVertical: 10, 
//     paddingHorizontal: 10,
//   },
//   card: { 
//     backgroundColor: "white", 
//     padding: 10, 
//     borderRadius: 10, 
//     marginBottom: 10, 
//     shadowColor: "#000", 
//     shadowOpacity: 0.1, 
//     shadowRadius: 5, 
//     paddingHorizontal: 10,
//   },
//   image: { 
//     width: "100%", 
//     height: 120, 
//     borderRadius: 10 
//   },
//   venue: { 
//     fontSize: 16, 
//     fontWeight: "bold", 
//     marginTop: 5 
//   },
//   address: { 
//     color: "gray" 
//   },
//   timeSlot: { 
//     fontSize: 14, 
//     color: "#FF4500" 
//   },
// });

import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet, Dimensions, Modal, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);

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
      status: "booked",
    },
    {
      id: "2",
      date: "2025-03-24",
      venue: "FOOTBALL FIELD",
      address: "123, Kandy Road, Colombo",
      contact: "0771234567",
      image: "https://images.theconversation.com/files/618058/original/file-20240909-16-tj4qv8.jpg?ixlib=rb-4.1.0&rect=49%2C523%2C3478%2C1739&q=45&auto=format&w=1356&h=668&fit=crop",
      timeSlot: "10:00 AM - 11:00 AM",
      status: "booked",
    },
    {
      id: "5",
      date: "2025-03-24",
      venue: "West Badminton Club",
      address: "123, Kandy Road, Colombo",
      contact: "0771234567",
      image: "https://media.istockphoto.com/id/691338554/photo/two-couples-playing-badminton.jpg?s=612x612&w=0&k=20&c=3y0Fhwq_fpyBAVZcVBjOqKO6C7nN8yAtAKLabk6KAfk=",
      timeSlot: "2:00 PM - 3:00 PM",
      status: "booked",
    },
    {
      id: "3",
      date: "2025-03-25",
      venue: "FOOTBALL FIELD",
      address: "123, Kandy Road, Colombo",
      contact: "0771234567",
      image: "https://images.theconversation.com/files/618058/original/file-20240909-16-tj4qv8.jpg?ixlib=rb-4.1.0&rect=49%2C523%2C3478%2C1739&q=45&auto=format&w=1356&h=668&fit=crop",
      timeSlot: "10:00 AM - 11:00 AM",
      status: "pending",
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

  // Filter bookings for the selected date
  const filteredBookings = bookings.filter((b) => b.date === selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      {/* Calendar */}
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setSelectedCard(null); // Reset selected card when changing date
        }}
        onDayLongPress={(day) => {
          setSelectedDate(day.dateString);
          setSelectedCard(null); // Reset selected card when changing date
        }}
        theme={{
          backgroundColor: "white",
          calendarBackground: "white",
          textSectionTitleColor: "black",
          dayTextColor: "black",
          arrowColor: "black",
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

      {/* Booking Details or Empty State */}
      <Text style={styles.title}>
        {selectedDate ? "Bookings" : "Select a date to view bookings"}
      </Text>

      {filteredBookings.length === 0 && selectedDate ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../assets/gif/empty.gif")}
            style={styles.emptyGif}
          />
          <Text style={styles.emptyText}>No bookings for this date!</Text>
        </View>
      ) : (
        <FlatList
          style={styles.flatList}
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate="fast"
          snapToInterval={Dimensions.get("window").width * 0.6 + 20}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedCard(item)}>
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.venue}>{item.venue}</Text>
                <Text style={styles.address}>{item.address}</Text>
                <Text style={styles.timeSlot}>Time Slot: {item.timeSlot}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal for Enlarged Card */}
      <Modal
        visible={!!selectedCard}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedCard(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setSelectedCard(null)}
          >
            {selectedCard && (
              <View style={styles.enlargedCard}>
                <Image source={{ uri: selectedCard.image }} style={styles.enlargedImage} />
                <Text style={styles.enlargedVenue}>{selectedCard.venue}</Text>
                <Text style={styles.enlargedAddress}>{selectedCard.address}</Text>
                <Text style={styles.enlargedTimeSlot}>Time Slot: {selectedCard.timeSlot}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedCard(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
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
    margin: 28,
    marginTop: -11,
    marginBottom: -5,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: "white",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    paddingHorizontal: 10,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    width: Dimensions.get("window").width * 0.6,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  venue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  address: {
    color: "gray",
  },
  timeSlot: {
    fontSize: 14,
    color: "#FF4500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    paddingTop: 10,
  },
  emptyGif: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  flatList: {
    flexGrow: 0,
  },
  flatListContent: {
    paddingHorizontal: Dimensions.get("window").width * 0.2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  enlargedCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: Dimensions.get("window").width * 0.9,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  enlargedImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
  },
  enlargedVenue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  enlargedAddress: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  enlargedTimeSlot: {
    fontSize: 16,
    color: "#FF4500",
    marginTop: 5,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#FF4500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});