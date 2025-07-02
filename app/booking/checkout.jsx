import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Checkout({ onClose }) {
  const router = useRouter();

  // Empty fields by default
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  const handlePay = () => {
    // Validation can be added here
    router.push("/booking/confirmation"); // Navigate to confirmation after payment
    onClose(); // Close the modal
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="p-0">
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
                  onChangeText={setExpiryDate}
                  className="flex-1 text-lg"
                  placeholder="MM/YY"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
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
                />
              </View>
               <View className="h-[1px] bg-gray-300 mt-3" />
            </View>
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
            onPress={handlePay}
            className="bg-secondary mt-14 p-3 rounded-[5px]"
          >
    <Text className="text-white text-center text-lg font-bold">
  Pay →
</Text>


          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}