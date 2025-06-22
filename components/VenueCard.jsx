import React from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";

export default function VenueCard({ onPress, name, address, contact, image, isOpen, closingTime }) {
  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-lg shadow m-2 p-3 w-60">
      <Image
        source={{ uri: image }}
        className="w-full h-24 rounded"
        resizeMode="cover"
      />
      <Text className="mt-2 text-lg font-bold">{name}</Text>
      <Text className="text-gray-600">{address}</Text>
      <Text className="text-gray-800">
        {isOpen ? "Open" : "Closed"} · Closes {closingTime}
      </Text>
    </TouchableOpacity>
  );
}
