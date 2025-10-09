import React, { useState, useRef } from 'react';
import { View, Image, TouchableOpacity, Dimensions, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function ImageGallery({ images, height = 200, showDots = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  if (!images || images.length === 0) {
    return (
      <View className="bg-gray-200 flex items-center justify-center" style={{ height }}>
        <Ionicons name="image-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 mt-2">No images available</Text>
      </View>
    );
  }

  if (images.length === 1) {
    return (
      <View style={{ height }}>
        <Image 
          source={{ uri: images[0] }} 
          className="w-full h-full" 
          resizeMode="cover"
          onError={(error) => {
            console.log("Image loading error:", error);
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", images[0]);
          }}
        />
      </View>
    );
  }

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  return (
    <View style={{ height }}>
      {/* Image Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ height }}
      >
        {images.map((image, index) => (
          <View key={index} style={{ width: screenWidth, height }}>
            <Image
              source={{ uri: image }}
              className="w-full h-full"
              resizeMode="cover"
              onError={(error) => {
                console.log(`Image ${index} loading error:`, error);
              }}
              onLoad={() => {
                console.log(`Image ${index} loaded successfully:`, image);
              }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {/* Left Arrow */}
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={() => scrollToIndex(currentIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-2"
              style={{ transform: [{ translateY: -20 }] }}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          )}

          {/* Right Arrow */}
          {currentIndex < images.length - 1 && (
            <TouchableOpacity
              onPress={() => scrollToIndex(currentIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-2"
              style={{ transform: [{ translateY: -20 }] }}
            >
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <View className="absolute top-4 right-4 bg-black/50 rounded-full px-3 py-1">
          <Text className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      {/* Dots Indicator */}
      {showDots && images.length > 1 && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2">
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
