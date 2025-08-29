import React from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function VenueCard({
  onPress,
  name,
  address,
  contact,
  image,
  isOpen,
  closingTime,
  isFavorite,
  onToggleFavorite,
  price,
  type,
  capacity,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg shadow m-2 p-3 w-60"
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: image }}
        className="w-full h-24 rounded"
        resizeMode="cover"
      />
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold flex-shrink">
          {name}
        </Text>
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={10}>
          <Ionicons
            name="heart"
            size={20}
            color={isFavorite ? "red" : "gray"}
          />
        </TouchableOpacity>
      </View>
      <Text className="text-gray-600">{address}</Text>
      
      {/* Additional venue information */}
      {price && (
        <Text className="text-blue-600 font-semibold mt-1">{price}</Text>
      )}
      
      <View className="flex-row items-center mt-1">
        {type && (
          <View className="bg-gray-100 px-2 py-1 rounded mr-2">
            <Text className="text-xs text-gray-700">{type}</Text>
          </View>
        )}
        {capacity && (
          <View className="bg-gray-100 px-2 py-1 rounded">
            <Text className="text-xs text-gray-700">Capacity: {capacity}</Text>
          </View>
        )}
      </View>
      
      <Text className="text-gray-800 mt-2">
        {isOpen ? "Open" : "Closed"} · Closes {closingTime}
      </Text>
    </TouchableOpacity>
  );
}
