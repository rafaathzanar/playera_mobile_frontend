import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VenueCard = ({ name, address, contact, image, isOpen, closingTime }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <View className="border rounded-lg overflow-hidden bg-white shadow-lg mb-4">
      
      <Image
        source={{ uri: image }}
        className="w-full h-40"
        resizeMode="cover"
      />

      
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-black">{name}</Text>
          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "red" : "black"}
            />
          </TouchableOpacity>
        </View>

        <Text className="text-gray-600 mb-1">{address}</Text>
        <Text className="text-gray-600 mb-3">{contact}</Text>

        
        <View className="flex-row items-center">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${
              isOpen ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <Text className="text-gray-600">
            {isOpen ? "Open" : "Closed"} · Closes {closingTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default VenueCard;
