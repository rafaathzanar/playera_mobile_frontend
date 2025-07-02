// import React from "react";
// import { TouchableOpacity, Text, View, Image } from "react-native";

// export default function VenueCard({ onPress, name, address, contact, image, isOpen, closingTime }) {
//   return (
//     <TouchableOpacity onPress={onPress} className="bg-white rounded-lg shadow m-2 p-3 w-60">
//       <Image
//         source={{ uri: image }}
//         className="w-full h-24 rounded"
//         resizeMode="cover"
//       />
//       <Text className="mt-2 text-lg font-bold">{name}</Text>
//       <Text className="text-gray-600">{address}</Text>
//       <Text className="text-gray-800">
//         {isOpen ? "Open" : "Closed"} · Closes {closingTime}
//       </Text>
//     </TouchableOpacity>
//   );
// }
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
      <Text className="text-gray-800">
        {isOpen ? "Open" : "Closed"} · Closes {closingTime}
      </Text>
    </TouchableOpacity>
  );
}
