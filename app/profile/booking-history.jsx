import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, CurrencyDollarIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import websocketService from "../../services/websocket";

export default function BookingHistory() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (user?.userId) {
      // Connect to WebSocket for real-time updates
      websocketService.connect(user.userId, handleWebSocketMessage)
        .then(() => {
          console.log('WebSocket connected for customer:', user.userId);
        })
        .catch(error => {
          console.error('Failed to connect WebSocket:', error);
        });

      // Cleanup on unmount
      return () => {
        websocketService.disconnect();
      };
    }
  }, [user?.userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getBookings({ customerId: user.userId });
      setBookings(response || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  // Handle WebSocket messages for real-time updates
  const handleWebSocketMessage = (type, data) => {
    switch (type) {
      case 'BOOKING_UPDATE':
        // Update booking status in real-time
        setBookings(prev => prev.map(booking => 
          booking.bookingId === data.bookingId 
            ? { ...booking, status: data.status }
            : booking
        ));
        break;
      
      default:
        console.log('Unknown WebSocket message type:', type);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PENDING':
        return 'Pending';
      case 'CANCELLED':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const isUpcoming = (booking) => {
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    return bookingDate >= now;
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') {
      return isUpcoming(booking);
    } else {
      return !isUpcoming(booking);
    }
  });

  const handleCancelBooking = async (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.cancelBooking(bookingId);
              Alert.alert('Success', 'Booking cancelled successfully');
              fetchBookings(); // Refresh the list
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const handleViewVenue = (venueId) => {
    router.push(`/venue/${venueId}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-gray-600">Loading bookings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-orange-500">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white ml-4">My Bookings</Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-gray-100 p-1 mx-4 mt-4 rounded-lg">
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-md ${
            activeTab === 'upcoming' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <Text className={`text-center font-medium ${
            activeTab === 'upcoming' ? 'text-orange-600' : 'text-gray-600'
          }`}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('past')}
          className={`flex-1 py-2 px-4 rounded-md ${
            activeTab === 'past' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <Text className={`text-center font-medium ${
            activeTab === 'past' ? 'text-orange-600' : 'text-gray-600'
          }`}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <CalendarIcon size={48} color="#9CA3AF" />
            <Text className="text-lg font-medium text-gray-500 mt-4">
              No {activeTab} bookings
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              {activeTab === 'upcoming' 
                ? 'You don\'t have any upcoming bookings'
                : 'You don\'t have any past bookings'
              }
            </Text>
          </View>
        ) : (
          <View className="py-4 space-y-4">
            {filteredBookings.map((booking) => (
              <View key={booking.bookingId} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                {/* Booking Header */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      {booking.venueName}
                    </Text>
                    <Text className="text-gray-600">{booking.courtName}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                    <Text className="text-xs font-medium">
                      {getStatusText(booking.status)}
                    </Text>
                  </View>
                </View>

                {/* Booking Details */}
                <View className="space-y-2 mb-4">
                  <View className="flex-row items-center">
                    <CalendarIcon size={16} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">
                      {formatDate(booking.bookingDate)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <ClockIcon size={16} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPinIcon size={16} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">
                      Duration: {booking.duration} hours
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <CurrencyDollarIcon size={16} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">
                      Total: LKR {booking.totalCost?.toFixed(2) || '0.00'}
                    </Text>
                  </View>
                </View>

                {/* Equipment Summary */}
                {booking.equipmentBookings && booking.equipmentBookings.length > 0 && (
                  <View className="bg-gray-50 p-3 rounded-lg mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Equipment:</Text>
                    {booking.equipmentBookings.map((equipment, index) => (
                      <Text key={index} className="text-sm text-gray-600">
                        • {equipment.equipmentName} x{equipment.quantity}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Special Requests */}
                {booking.specialRequests && (
                  <View className="bg-blue-50 p-3 rounded-lg mb-4">
                    <Text className="text-sm font-medium text-blue-700 mb-1">Special Requests:</Text>
                    <Text className="text-sm text-blue-600">{booking.specialRequests}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => handleViewVenue(booking.venueId)}
                    className="flex-1 bg-blue-600 py-2 px-4 rounded-lg"
                  >
                    <Text className="text-white text-center font-medium">View Venue</Text>
                  </TouchableOpacity>
                  
                  {activeTab === 'upcoming' && booking.status === 'PENDING' && (
                    <TouchableOpacity
                      onPress={() => handleCancelBooking(booking.bookingId)}
                      className="flex-1 bg-red-600 py-2 px-4 rounded-lg"
                    >
                      <Text className="text-white text-center font-medium">Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Booking ID */}
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <Text className="text-xs text-gray-500 text-center">
                    Booking ID: #{booking.bookingId}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


