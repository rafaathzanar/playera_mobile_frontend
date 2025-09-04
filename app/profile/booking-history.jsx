import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { formatDateForDisplay } from "../../utils/dateUtils";

export default function BookingHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookingHistory();
  }, []);

  const loadBookingHistory = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.userId) {
        console.log("No user found, cannot load booking history");
        setBookings([]);
        return;
      }

      const bookingData = await api.getBookingsByCustomer(user.userId);
      console.log("Booking history data:", bookingData);
      
      // Handle paginated response structure
      const bookingsData = bookingData.content || bookingData;
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error loading booking history:", error);
      Alert.alert("Error", "Failed to load booking history");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookingHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return formatDateForDisplay(dateString);
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      case "completed":
        return "#2196F3";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4B00" />
        <Text style={styles.loadingText}>Loading booking history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptyText}>
              You haven't made any bookings yet. Start exploring venues and make your first booking!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/home")}
            >
              <Text style={styles.exploreButtonText}>Explore Venues</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.map((booking, index) => (
              <View key={booking.bookingId || index} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.venueName}>
                    {booking.venueName || "Unknown Venue"}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(booking.bookingStatus || booking.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(booking.bookingStatus || booking.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Court:</Text>
                    <Text style={styles.detailValue}>
                      {booking.courtName || "Unknown Court"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(booking.bookingDate || booking.date)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <View style={styles.detailValue}>
                      {booking.timeSlotRanges && booking.timeSlotRanges.length > 0 ? (
                        booking.timeSlotRanges.map((range, index) => (
                          <Text key={index} style={styles.detailValue}>
                            {formatTime(range.startTime)} - {formatTime(range.endTime)}
                            {index < booking.timeSlotRanges.length - 1 && '\n'}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.detailValue}>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>
                      {booking.duration || "N/A"} hours
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Amount:</Text>
                    <Text style={[styles.detailValue, styles.amountText]}>
                      LKR {booking.totalCost || booking.totalAmount || "0.00"}
                    </Text>
                  </View>

                  {(booking.specialRequests || booking.notes) && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.detailLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{booking.specialRequests || booking.notes}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.bookingFooter}>
                  <Text style={styles.bookingId}>
                    Booking ID: {booking.bookingId || "N/A"}
                  </Text>
                  <Text style={styles.createdAt}>
                    Booked on: {formatDate(booking.createdAt || booking.bookingDate || booking.date)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 16,
    color: "#FF4B00",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: "#FF4B00",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bookingsList: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  venueName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  amountText: {
    fontWeight: "bold",
    color: "#FF4B00",
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
    marginTop: 4,
  },
  bookingFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  bookingId: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 12,
    color: "#666",
  },
});