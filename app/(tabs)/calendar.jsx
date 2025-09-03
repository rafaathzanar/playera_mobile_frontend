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

  // Format time function to handle LocalTime format from backend
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Handle LocalTime format from backend (HH:MM:SS)
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString.substring(0, 5); // "06:00:00" -> "06:00"
    }
    // If it's already in HH:MM format, return as is
    if (typeof timeString === 'string' && timeString.includes(':') && timeString.split(':').length === 2) {
      return timeString;
    }
    // If it's in HH:MM:SS format, remove seconds
    if (typeof timeString === 'string' && timeString.includes(':') && timeString.split(':').length === 3) {
      return timeString.substring(0, 5); // Remove seconds
    }
    return timeString;
  };

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
              <View style={styles.venueInfo}>
                <Text style={styles.venue}>{item.venueName || 'Unknown Venue'}</Text>
                <Text style={styles.court}>{item.courtName || 'Unknown Court'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status || 'UNKNOWN'}</Text>
              </View>
            </View>
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Time Slots:</Text>
              {item.timeSlotRanges && item.timeSlotRanges.length > 0 ? (
                <View style={styles.timeRangesContainer}>
                  {item.timeSlotRanges.map((range, index) => (
                    <View key={index} style={styles.timeRangeItem}>
                      <Text style={styles.timeRange}>
                        {formatTime(range.startTime)} - {formatTime(range.endTime)}
                      </Text>
                      <Text style={styles.duration}>({range.duration}h)</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.timeRangeItem}>
                  <Text style={styles.timeRange}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Text>
                  <Text style={styles.duration}>({item.duration}h)</Text>
                </View>
              )}
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.costContainer}>
                <Text style={styles.costLabel}>Total Cost</Text>
                <Text style={styles.cost}>LKR {item.totalCost?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.bookingIdContainer}>
                <Text style={styles.bookingIdLabel}>Booking ID</Text>
                <Text style={styles.bookingId}>#{item.bookingId}</Text>
              </View>
            </View>
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
    marginBottom: 11,
    color: "#333"
  },
  calendar: { 
    margin: 20,
    marginTop: -12,
    marginBottom: -5,
    padding: 10,   
    borderRadius: 8, 
    elevation: 2, 
  },
  legendContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginVertical: 5, 
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
    fontSize: 14, 
    fontWeight: "thin", 
    marginVertical: 5, 
    paddingHorizontal: 10,
    color: "#333"
  },
  card: { 
    backgroundColor: "white", 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 16, 
    shadowColor: "#000", 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16
  },
  venueInfo: {
    flex: 1,
    marginRight: 12
  },
  venue: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1F2937",
    marginBottom: 4
  },
  court: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500"
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  timeContainer: {
    marginBottom: 16
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8
  },
  timeRangesContainer: {
    gap: 6
  },
  timeRangeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF4B00"
  },
  timeRange: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1
  },
  duration: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500"
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6"
  },
  costContainer: {
    flex: 1
  },
  costLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2
  },
  cost: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF4B00"
  },
  bookingIdContainer: {
    alignItems: "flex-end"
  },
  bookingIdLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2
  },
  bookingId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151"
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