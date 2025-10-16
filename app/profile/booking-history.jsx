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
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

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
      
      // Debug date fields
      if (Array.isArray(bookingData.content || bookingData)) {
        const bookings = bookingData.content || bookingData;
        if (bookings.length > 0) {
          console.log("=== DATE DEBUG ===");
          console.log("First booking bookingDate:", bookings[0].bookingDate);
          console.log("First booking createdAt:", bookings[0].createdAt);
          console.log("First booking date:", bookings[0].date);
          console.log("=== END DATE DEBUG ===");
        }
      }
      
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
      // Handle LocalDateTime format (YYYY-MM-DDTHH:MM:SS)
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const datePart = dateString.split('T')[0]; // Extract just the date part
        return formatDateForDisplay(datePart);
      }
      
      // Handle LocalDate format (YYYY-MM-DD) or other date strings
      return formatDateForDisplay(dateString);
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateString);
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

  const canCancelBooking = (booking) => {
    // Check if booking is not already cancelled or completed
    const status = booking.bookingStatus || booking.status;
    if (status?.toLowerCase() === 'cancelled' || status?.toLowerCase() === 'completed') {
      return false;
    }

    // Check if booking is at least 6 hours in the future
    const bookingDate = new Date(booking.bookingDate || booking.date);
    const now = new Date();
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    
    return bookingDate > sixHoursFromNow;
  };

  const handleCancelBooking = async (booking) => {
    const bookingId = booking.bookingId;
    
    // Calculate refund amount based on cancellation policy
    const bookingDate = new Date(booking.bookingDate || booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let refundPercentage = 0;
    let refundAmount = 0;
    let policyText = "";
    
    if (hoursUntilBooking >= 24) {
      refundPercentage = 100;
      refundAmount = booking.totalCost || booking.totalAmount || 0;
      policyText = "Full refund (100%) - Cancelled 24+ hours before booking";
    } else if (hoursUntilBooking >= 6) {
      refundPercentage = 50;
      refundAmount = (booking.totalCost || booking.totalAmount || 0) * 0.5;
      policyText = "Partial refund (50%) - Cancelled 6-24 hours before booking";
    } else {
      refundPercentage = 0;
      refundAmount = 0;
      policyText = "No refund - Cancelled less than 6 hours before booking";
    }
    
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel this booking?\n\n` +
      `📋 Cancellation Policy:\n${policyText}\n\n` +
      `💰 Refund Amount: LKR ${refundAmount.toFixed(2)}\n\n` +
      `This action cannot be undone.`,
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setCancellingBookingId(bookingId);
              await api.cancelBooking(bookingId);
              
              Alert.alert(
                "Booking Cancelled",
                `Your booking has been cancelled successfully.\n\n` +
                `💰 Refund Amount: LKR ${refundAmount.toFixed(2)}\n` +
                `📋 Refund Policy: ${policyText}\n\n` +
                `The refund will be processed according to our cancellation policy.`,
                [{ text: "OK" }]
              );
              
              // Refresh the booking history
              await loadBookingHistory();
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert(
                "Cancellation Failed",
                error.message || "Failed to cancel booking. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setCancellingBookingId(null);
            }
          }
        }
      ]
    );
  };

  const getCancellationDeadline = (booking) => {
    const bookingDate = new Date(booking.bookingDate || booking.date);
    const deadline = new Date(bookingDate.getTime() - 6 * 60 * 60 * 1000);
    return deadline.toLocaleString();
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
                  
                  {canCancelBooking(booking) && (
                    <View style={styles.cancellationInfo}>
                      <Text style={styles.cancellationDeadline}>
                        Cancellation deadline: {getCancellationDeadline(booking)}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,
                          cancellingBookingId === booking.bookingId && styles.cancelButtonDisabled
                        ]}
                        onPress={() => handleCancelBooking(booking)}
                        disabled={cancellingBookingId === booking.bookingId}
                      >
                        {cancellingBookingId === booking.bookingId ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
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
  cancellationInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancellationDeadline: {
    fontSize: 12,
    color: "#FF9800",
    marginBottom: 8,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  cancelButtonDisabled: {
    backgroundColor: "#ccc",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});