import React from "react";
import { TouchableOpacity, Image, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function VenueCard({
  onPress,
  name,
  address,
  image,
  isOpen,
  closingTime,
  openingTime,
  isFavorite,
  onToggleFavorite,
}) {
  // Function to check if venue is currently open based on current time
  const isCurrentlyOpen = () => {
    if (!openingTime || !closingTime) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
    
    // Parse opening and closing times
    const parseTime = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      
      if (period === 'PM' && hours !== 12) {
        totalMinutes += 12 * 60; // Add 12 hours for PM
      } else if (period === 'AM' && hours === 12) {
        totalMinutes -= 12 * 60; // Subtract 12 hours for 12 AM
      }
      
      return totalMinutes;
    };
    
    try {
      const openTime = parseTime(openingTime);
      const closeTime = parseTime(closingTime);
      
      // Handle cases where closing time is next day (e.g., 11 PM - 2 AM)
      if (closeTime < openTime) {
        return currentTime >= openTime || currentTime <= closeTime;
      } else {
        return currentTime >= openTime && currentTime <= closeTime;
      }
    } catch (error) {
      return false; // If parsing fails, default to closed
    }
  };

  const currentlyOpen = isCurrentlyOpen();
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl shadow-lg w-64 h-56 mx-2"
      activeOpacity={0.8}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* Image with gradient overlay */}
      <View className="relative">
        {image ? (
          <Image
            source={{ uri: image }}
            className="w-full h-28 rounded-t-2xl"
            resizeMode="cover"
            onError={(error) => {
              console.log("=== IMAGE LOADING ERROR ===");
              console.log("Error:", error);
              console.log("Failed to load image:", image);
              console.log("Error details:", error.nativeEvent);
              console.log("==========================");
            }}
            onLoad={() => {
              console.log("=== IMAGE LOADED SUCCESSFULLY ===");
              console.log("Image URL:", image);
              console.log("=================================");
            }}
            onLoadStart={() => {
              console.log("=== IMAGE LOADING STARTED ===");
              console.log("Image URL:", image);
              console.log("=============================");
            }}
            onLoadEnd={() => {
              console.log("=== IMAGE LOADING ENDED ===");
              console.log("Image URL:", image);
              console.log("==========================");
            }}
          />
        ) : (
          <View className="w-full h-28 rounded-t-2xl bg-gray-200 flex items-center justify-center">
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}
        <View className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-black/20 rounded-t-2xl" />
        
        {/* Favorite button */}
        <TouchableOpacity 
          onPress={onToggleFavorite} 
          hitSlop={10}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2"
        >
          <Ionicons
            name="heart"
            size={16}
            color={isFavorite ? "#EF4444" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
      
      <View className="flex-1 p-3">
        {/* Venue name - fixed height */}
        <View className="h-6 mb-2">
          <Text 
            className="text-base font-bold text-gray-900" 
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {name}
          </Text>
        </View>
        
        {/* Address - fixed height */}
        <View className="h-6 mb-3">
          <Text 
            className="text-sm text-gray-600" 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {address}
          </Text>
        </View>
        
        {/* Spacer to push opening hours to bottom */}
        <View className="flex-1" />
        
        {/* Opening/Closing time - fixed at bottom */}
        <View className="items-center">
          <View className="flex-row items-center">
            <Ionicons 
              name="time-outline" 
              size={12} 
              color={currentlyOpen ? "#10B981" : "#EF4444"} 
            />
            <Text className="text-xs text-gray-600 ml-1 font-medium">
              {openingTime && closingTime 
                ? `${openingTime} - ${closingTime}` 
                : 'Hours not available'
              }
            </Text>
            <View className={`ml-2 w-1.5 h-1.5 rounded-full ${currentlyOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-xs font-semibold ml-1" style={{ color: currentlyOpen ? '#10B981' : '#EF4444' }}>
              {currentlyOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
