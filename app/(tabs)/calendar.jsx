import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Fetch user's bookings
  useEffect(() => {
    if (user?.userId) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getBookingsByCustomer(user.userId);
      console.log("Calendar bookings data:", response);
      
      // Handle paginated response structure
      const bookingsData = response.content || response;
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserBookings();
    setRefreshing(false);
  };

  // Dynamically generate markedDates from the bookings
  const markedDates = bookings.reduce((acc, booking) => {
    let color = "gray"; // Default color
    
    switch (booking.status?.toUpperCase()) {
      case "CONFIRMED":
        color = "green";
        break;
      case "PENDING":
        color = "yellow";
        break;
      case "CANCELLED":
        color = "red";
        break;
      case "COMPLETED":
        color = "blue";
        break;
      default:
        color = "gray";
    }
    
    const dateKey = booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : null;
    if (dateKey) {
      acc[dateKey] = { marked: true, dotColor: color };
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Booking Calendar</Text>
      
      {/* Calendar */}
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: "white",
          calendarBackground: "white",
          textSectionTitleColor: "#333",
          dayTextColor: "#333",
          arrowColor: "#FF4B00",
          selectedDayBackgroundColor: "#FF4B00",
          selectedDayTextColor: "white",
          todayTextColor: "#FF4B00",
        }}
        style={styles.calendar}
      />

      {/* Booking Legends */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "green" }]} />
          <Text>Confirmed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "yellow" }]} />
          <Text>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "red" }]} />
          <Text>Cancelled</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "blue" }]} />
          <Text>Completed</Text>
        </View>
      </View>

      {/* Booking Details */}
      <Text style={styles.sectionTitle}>
        {selectedDate ? `Bookings on ${selectedDate}` : "Select a date to view bookings"}
      </Text>

      <FlatList
        data={bookings.filter((b) => {
          if (!selectedDate) return false;
          const bookingDate = b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : null;
          return bookingDate === selectedDate;
        })}
        keyExtractor={(item) => item.bookingId?.toString() || item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.venue}>{item.venueName || item.courtName || 'Unknown Venue'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status || 'UNKNOWN'}</Text>
              </View>
            </View>
            <Text style={styles.timeSlot}>
              {item.startTime} - {item.endTime} ({item.duration} hours)
            </Text>
            <Text style={styles.cost}>LKR {item.totalCost?.toFixed(2) || '0.00'}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedDate ? 'No bookings on this date' : 'Select a date to view your bookings'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return "#10B981";
    case "PENDING":
      return "#F59E0B";
    case "CANCELLED":
      return "#EF4444";
    case "COMPLETED":
      return "#3B82F6";
    default:
      return "#6B7280";
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "white", 
    padding: 20,  
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333"
  },
  calendar: { 
    margin: 20,
    marginTop: -4,
    marginBottom: -5,
    padding: 10,   
    borderRadius: 8, 
    elevation: 2, 
  },
  legendContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginVertical: 20, 
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
  sectionTitle: {
    fontSize: 18, 
    fontWeight: "bold", 
    marginVertical: 10, 
    paddingHorizontal: 10,
    color: "#333"
  },
  card: { 
    backgroundColor: "white", 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  venue: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#333",
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600"
  },
  timeSlot: { 
    fontSize: 14, 
    color: "#666",
    marginBottom: 5
  },
  cost: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF4B00"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center"
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center"
  }
});