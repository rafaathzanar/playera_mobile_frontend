import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "../../services/api";

export default function Checkout({ onClose, bookingData }) {
  const router = useRouter();

  // Form fields
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");

  // Validation
  const validateForm = () => {
    if (!cardHolderName.trim()) {
      Alert.alert('Error', 'Please enter card holder name');
      return false;
    }
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      Alert.alert('Error', 'Please enter expiry date in MM/YY format');
      return false;
    }
    if (!cvv.match(/^\d{3,4}$/)) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create the booking request in the format expected by the backend
      const bookingRequest = {
        customerId: bookingData.customerId,
        bookingDate: bookingData.bookingDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: bookingData.duration,
        specialRequests: specialRequests,
        // Transform to the expected backend format
        courtBookings: [{
          courtId: bookingData.courtId,
          timeDuration: bookingData.duration
        }],
        equipmentBookings: (bookingData.selectedEquipment || []).map(equipment => ({
          equipmentId: equipment.id,
          quantity: equipment.quantity,
          timeDuration: bookingData.duration
        }))
      };

      console.log('Creating booking with data:', bookingRequest);

      // Create the booking
      const createdBooking = await api.createBooking(bookingRequest);
      console.log('Booking created:', createdBooking);

      if (createdBooking && createdBooking.bookingId) {
        // Create payment record
        const paymentData = {
          bookingId: createdBooking.bookingId,
          amount: parseFloat(bookingData.totalCost),
          paymentMethod: 'CREDIT_CARD',
          status: 'PENDING',
          transactionId: `TXN_${Date.now()}`,
          paymentDate: new Date().toISOString()
        };

        console.log('Creating payment with data:', paymentData);
        const createdPayment = await api.createPayment(paymentData);
        console.log('Payment created:', createdPayment);

        // Show success message
        Alert.alert(
          'Booking Successful!',
          'Your court booking has been confirmed. You will receive a confirmation email shortly.',
          [
            {
              text: 'View Bookings',
              onPress: () => {
                onClose();
                // Navigate to bookings list or profile
                // You can implement navigation logic here
              }
            },
            {
              text: 'OK',
              onPress: onClose
            }
          ]
        );
      } else {
        throw new Error('Failed to create booking - no booking ID returned');
      }

    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(
        'Booking Failed',
        error.message || 'An error occurred while creating your booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="p-0">
        {/* Booking Summary */}
        <View className="bg-gray-50 p-4 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-800 mb-2">Booking Summary</Text>
          <Text className="text-gray-600">{bookingData?.venue?.name || 'Venue'}</Text>
          <Text className="text-gray-600">{bookingData?.court?.courtName || 'Court'}</Text>
          <Text className="text-gray-600">
            {bookingData?.duration} hours • {new Date(bookingData?.bookingDate).toLocaleDateString()}
          </Text>
          <Text className="text-lg font-bold text-orange-500 mt-2">
            Total: LKR {bookingData?.totalCost?.toFixed(2) || '0.00'}
          </Text>
        </View>

        {/* Add New Card */}
        <TouchableOpacity onPress={() => router.push("/add-card")}>
          <Text
            className="text-sm mb-2 mt-5 self-end mr-4"
            style={{ color: "#FF4B00" }}
          >
            Add New Card +
          </Text>
        </TouchableOpacity>

        {/* Card Details Section */}
        <View className="bg-white w-full p-6 rounded-t-[20px]">
          <Text className="text-black text-lg font-bold text-center mb-4">Card Details</Text>
          <View className="border-b border-gray-300 mb-4" />

          {/* Card Holder Name */}
          <View className="mb-4 mt-4">
            <Text className="text-black mb-2">CARD HOLDER NAME</Text>
            <View className="flex-row items-center">
              <Image
                source={require("../../assets/icons/profile2.png")}
                className="w-5 mt-2 h-5 mr-2"
              />
              <TextInput
                value={cardHolderName}
                onChangeText={setCardHolderName}
                className="flex-1 ml-2 text-lg"
                placeholder="Enter card holder name"
                placeholderTextColor="gray"
                style={{ lineHeight: 20 }}
              />
            </View>
            <View className="h-[1px] bg-gray-300 mt-3" />
          </View>

          {/* Card Number */}
          <View className="mb-4 mt-4">
            <Text className="text-black mb-2">CARD NUMBER</Text>
            <View className="flex-row items-center">
              <Image
                source={require("../../assets/icons/card.png")}
                className="w-5 h-8 mr-2"
              />
              <TextInput
                value={cardNumber}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || "";
                  setCardNumber(formatted);
                }}
                className="flex-1 ml-2 text-lg py-1"
                placeholder="Enter card number"
                placeholderTextColor="gray"
                keyboardType="numeric"
                style={{ lineHeight: 22 }}
                maxLength={19}
              />
            </View>
            <View className="h-[1px] bg-gray-300 mt-3" />
          </View>

          {/* Expiry and CVV */}
          <View className="flex-row justify-between mb-4 mt-4">
            <View className="flex-1 mr-2">
              <Text className="text-black mb-2">VALID THRU</Text>
              <View className="flex-row items-center">
                <Image
                  source={require("../../assets/icons/calender.png")}
                  className="w-5 h-5 mr-2"
                />
                <TextInput
                  value={expiryDate}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "");
                    if (cleaned.length >= 2) {
                      setExpiryDate(cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4));
                    } else {
                      setExpiryDate(cleaned);
                    }
                  }}
                  className="flex-1 text-lg"
                  placeholder="MM/YY"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View className="h-[1px] bg-gray-300 mt-3" />
            </View>

            <View className="flex-1 ml-2">
              <Text className="text-black mb-2">CVV/CVC</Text>
              <View className="flex-row items-center">
                <Image
                  source={require("../../assets/icons/lock.png")}
                  className="w-5 h-5 mr-2"
                />
                <TextInput
                  value={cvv}
                  onChangeText={setCvv}
                  className="flex-1 text-lg"
                  placeholder="CVV"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
              <View className="h-[1px] bg-gray-300 mt-3" />
            </View>
          </View>

          {/* Special Requests */}
          <View className="mb-4 mt-4">
            <Text className="text-black mb-2">SPECIAL REQUESTS (Optional)</Text>
            <TextInput
              value={specialRequests}
              onChangeText={setSpecialRequests}
              className="border border-gray-300 p-3 rounded-lg"
              placeholder="Any special requests or notes..."
              placeholderTextColor="gray"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            onPress={() => setSaveCard(!saveCard)}
            className="flex-row items-center mt-4"
          >
            <Image
              source={{
                uri: saveCard
                  ? "https://img.icons8.com/ios-filled/20/000000/checked.png"
                  : "https://img.icons8.com/ios/20/000000/unchecked-checkbox.png",
              }}
              className="w-5 h-5 mr-2"
            />
            <Text className="text-black text-sm">
              Save the card details for faster payment
            </Text>
          </TouchableOpacity>

          {/* Pay Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`mt-14 p-3 rounded-lg ${
              loading ? 'bg-gray-400' : 'bg-orange-500'
            }`}
          >
            <Text className="text-white text-center text-lg font-bold">
              {loading ? 'Processing...' : 'Pay →'}
            </Text>
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="mt-6 bg-blue-50 p-3 rounded-lg">
            <Text className="text-xs text-blue-800 text-center">
              🔒 Your payment information is secure and encrypted. 
              We use industry-standard security measures to protect your data.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}