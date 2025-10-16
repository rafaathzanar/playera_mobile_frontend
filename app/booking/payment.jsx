import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { formatDateForDisplay } from '../../utils/dateUtils';

const PaymentScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Parse booking data from params
  const bookingData = {
    venueId: params.venueId,
    courtId: params.courtId,
    selectedDate: params.selectedDate,
    startTime: params.startTime,
    endTime: params.endTime,
    totalDuration: parseFloat(params.totalDuration),
    totalCost: parseFloat(params.totalCost),
    courtCost: parseFloat(params.courtCost) || 0,
    equipmentCost: parseFloat(params.equipmentCost) || 0,
    courtName: params.courtName,
    venueName: params.venueName,
    selectedSlots: (() => {
      try {
        return JSON.parse(params.selectedSlots || '[]');
      } catch (error) {
        console.error('Error parsing selectedSlots:', error);
        return [];
      }
    })(),
    selectedEquipment: (() => {
      try {
        return JSON.parse(params.selectedEquipment || '[]');
      } catch (error) {
        console.error('Error parsing selectedEquipment:', error);
        return [];
      }
    })(),
    customerId: params.customerId,
    specialRequests: params.specialRequests || '',
    timeSlotRanges: (() => {
      try {
        return JSON.parse(params.timeSlotRanges || '[]');
      } catch (error) {
        console.error('Error parsing timeSlotRanges:', error);
        return [];
      }
    })()
  };

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      
      const paymentIntentData = {
        amount: Math.round(bookingData.totalCost), // Send amount in LKR (backend will convert to cents)
        currency: 'LKR',
        description: `Booking at ${bookingData.venueName} - ${bookingData.courtName}`,
        customerEmail: user?.email || 'customer@example.com',
        customerName: user?.name || 'Customer',
        customerPhone: user?.phone || '',
        bookingId: null // Will be set after booking creation
      };

      console.log('Creating payment intent with data:', paymentIntentData);
      console.log('Original total cost:', bookingData.totalCost, 'LKR');
      console.log('Amount being sent to backend:', paymentIntentData.amount, 'LKR');
      
      const response = await api.createPaymentIntent(paymentIntentData);

      if (response.paymentIntentId && response.clientSecret) {
        setPaymentIntent(response);
        
        // Initialize payment sheet
        const { error } = await initPaymentSheet({
          merchantDisplayName: 'PlayEra',
          paymentIntentClientSecret: response.clientSecret,
          defaultBillingDetails: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@example.com',
          },
        });

        if (error) {
          console.error('Payment sheet initialization error:', error);
          Alert.alert('Error', 'Failed to initialize payment. Please try again.');
        }
      } else {
        throw new Error('Invalid payment intent response');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      Alert.alert('Error', 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      
      const { error } = await presentPaymentSheet();

      if (error) {
        console.error('Payment error:', error);
        if (error.code === 'Canceled') {
          // User canceled payment
          return;
        }
        Alert.alert('Payment Failed', error.message || 'Payment could not be completed. Please try again.');
        return;
      }

      // Payment sheet completed without error, but we need to verify the actual payment status
      console.log('Payment sheet completed, verifying payment status...');
      await verifyAndCreateBooking();
      
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const verifyAndCreateBooking = async () => {
    try {
      if (!paymentIntent || !paymentIntent.paymentIntentId) {
        throw new Error('Payment intent not found');
      }

      // Verify payment status with Stripe
      console.log('Verifying payment status for:', paymentIntent.paymentIntentId);
      const paymentStatus = await api.getPaymentIntentStatus(paymentIntent.paymentIntentId);
      
      console.log('Payment status response:', paymentStatus);
      
      if (paymentStatus.status === 'succeeded') {
        console.log('Payment verified as successful, creating booking...');
        await createBooking();
      } else if (paymentStatus.status === 'requires_payment_method') {
        Alert.alert('Payment Failed', 'Payment method was declined. Please try a different payment method.');
      } else if (paymentStatus.status === 'requires_action') {
        Alert.alert('Payment Failed', 'Additional authentication required. Please try again.');
      } else {
        Alert.alert('Payment Failed', `Payment status: ${paymentStatus.status}. Please try again.`);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      Alert.alert('Payment Verification Failed', 'Could not verify payment status. Please contact support.');
    }
  };

  const createBooking = async () => {
    try {
      // Prepare the booking request with payment verification
      const bookingRequest = {
        customerId: parseInt(bookingData.customerId),
        bookingDate: bookingData.selectedDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: Math.round(bookingData.totalDuration),
        specialRequests: bookingData.specialRequests || "",
        courtBookings: [{
          courtId: parseInt(bookingData.courtId),
          timeDuration: bookingData.totalDuration
        }],
        equipmentBookings: bookingData.selectedEquipment && bookingData.selectedEquipment.length > 0 
          ? bookingData.selectedEquipment.map(equipment => ({
              equipmentId: parseInt(equipment.id),
              quantity: parseInt(equipment.quantity),
              timeDuration: bookingData.totalDuration
            }))
          : [],
        timeSlotRanges: bookingData.timeSlotRanges || [],
        paymentIntentId: paymentIntent?.paymentIntentId, // Include payment intent for verification
        totalCost: bookingData.totalCost // Include total cost calculated by frontend (includes dynamic pricing)
      };

      console.log('Creating booking with payment verification:', bookingRequest);
      console.log('Payment Intent ID:', paymentIntent?.paymentIntentId);
      
      // Create the booking using the secure endpoint that verifies payment
      const createdBookingResponse = await api.createBookingWithPayment(bookingRequest);
      console.log('Booking created successfully after payment verification:', createdBookingResponse);

      if (createdBookingResponse && createdBookingResponse.bookingId) {
        // Show success message
        Alert.alert(
          'Payment & Booking Successful! 🎉',
          'Your payment has been processed and court booking has been confirmed. You will receive a confirmation email shortly.',
          [
            {
              text: 'View My Bookings',
              onPress: () => {
                router.push('/profile');
              }
            },
            {
              text: 'OK',
              onPress: () => {
                router.push(`/venue/${bookingData.venueId}`);
              }
            }
          ]
        );
      } else {
        throw new Error('Invalid booking response - no booking ID received');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      console.error('Payment Intent ID:', paymentIntent?.paymentIntentId);
      console.error('Payment Status:', paymentIntent?.status);
      
      // Extract error message from response
      let errorMessage = 'Payment was successful but booking creation failed.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific validation errors
      if (errorMessage.includes('Booking duration must be at least')) {
        errorMessage = 'Booking duration requirement not met. Please go back and select more time slots.';
      } else if (errorMessage.includes('Court is not available')) {
        errorMessage = 'The selected time slots are no longer available. Please go back and select different slots.';
      } else if (errorMessage.includes('Customer not found')) {
        errorMessage = 'User account issue. Please log out and log back in.';
      }
      
      Alert.alert(
        'Booking Failed', 
        `${errorMessage}\n\nPayment Reference: ${paymentIntent?.paymentIntentId || 'Unknown'}\n\nPlease contact support if this issue persists.`,
        [
          {
            text: 'Go Back',
            onPress: () => router.back()
          },
          {
            text: 'Contact Support',
            onPress: () => {
              // You could add a contact support action here
              console.log('Contact support pressed');
            }
          }
        ]
      );
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatDate = (dateString) => {
    return formatDateForDisplay(dateString);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Preparing payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A202C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Venue:</Text>
            <Text style={styles.summaryValue}>{bookingData.venueName}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Court:</Text>
            <Text style={styles.summaryValue}>{bookingData.courtName}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>{formatDate(bookingData.selectedDate)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>
              {formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{bookingData.totalDuration} hours</Text>
          </View>

          {bookingData.selectedEquipment && bookingData.selectedEquipment.length > 0 && (
            <View style={styles.equipmentSection}>
              <Text style={styles.equipmentTitle}>Equipment:</Text>
              {bookingData.selectedEquipment.map((equipment, index) => (
                <Text key={index} style={styles.equipmentItem}>
                  {equipment.name} x{equipment.quantity}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Cost Breakdown */}
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>Cost Breakdown</Text>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Court Cost:</Text>
            <Text style={styles.costValue}>LKR {bookingData.courtCost.toFixed(2)}</Text>
          </View>
          
          {bookingData.equipmentCost > 0 && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Equipment Cost:</Text>
              <Text style={styles.costValue}>LKR {bookingData.equipmentCost.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>LKR {bookingData.totalCost.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Button */}
        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={[styles.paymentButton, paymentLoading && styles.paymentButtonDisabled]}
            onPress={handlePayment}
            disabled={paymentLoading || !paymentIntent}
          >
            {paymentLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="card" size={20} color="white" />
                <Text style={styles.paymentButtonText}>
                  Pay LKR {bookingData.totalCost.toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.paymentNote}>
            Secure payment powered by Stripe
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PaymentScreenWithStripe = () => {
  return (
    <StripeProvider
      publishableKey="pk_test_51S3OwSRrZiHD6OrGgnRw60iqyfaUDMHkfBQpsFSultxed4X9ocEZGDdFoCycJAENGFbMuejsz8EZAWVSjzIYh2Id00Supqb0mX" // This will be updated with real key
      merchantIdentifier="merchant.com.playera"
      urlScheme="playera"
    >
      <PaymentScreen />
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
  },
  equipmentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  equipmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  equipmentItem: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  costCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  costTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  paymentSection: {
    padding: 20,
  },
  paymentButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
  },
});

export default PaymentScreenWithStripe;
