import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, Image, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import api from '../../../services/api';

export default function CourtDetail() {
  const { courtId, venueId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  
  // State
  const [court, setCourt] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch court and venue data
  useEffect(() => {
    const fetchCourtData = async () => {
      try {
        setLoading(true);
        
        // Fetch court details
        const courtData = await api.getCourtById(courtId);
        setCourt(courtData);
        
        // Fetch venue details if venueId is provided
        if (venueId) {
          const venueData = await api.getVenueById(venueId);
          setVenue(venueData);
        }
        
      } catch (error) {
        console.error('Error fetching court data:', error);
        Alert.alert('Error', 'Failed to load court information');
      } finally {
        setLoading(false);
      }
    };

    if (courtId) {
      fetchCourtData();
    }
  }, [courtId, venueId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-gray-600">Loading court details...</Text>
      </SafeAreaView>
    );
  }

  if (!court) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-red-500">Court not found!</Text>
      </SafeAreaView>
    );
  }

  const handleBookNow = () => {
    router.push({
      pathname: '/booking/slot-selection',
      params: {
        venueId: venueId,
        courtId: courtId
      }
    });
  };

  // Get court image
  const getCourtImage = (court) => {
    if (court.imageUrl) {
      return court.imageUrl;
    }
    if (court.images && court.images.length > 0) {
      return court.images[0];
    }
    return null;
  };

  // Format price for display
  const formatPrice = (pricePerHour) => {
    if (!pricePerHour) return 'Price not available';
    return `LKR ${pricePerHour}/hour`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Header */}
        <View>
          <View className="flex-row items-center p-2" style={{ backgroundColor: '#FF4B00' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} className="pr-1">
              <ArrowLeftIcon size={20} color="white" style={{ marginLeft: 15 }} />
            </TouchableOpacity>
            <Text className="font-bold text-lg text-white text-center flex-1">
              COURT DETAILS
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Court Image */}
        {getCourtImage(court) ? (
          <Image 
            source={{ uri: getCourtImage(court) }} 
            className="w-full h-48" 
            resizeMode="cover" 
          />
        ) : (
          <View className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">No image available</Text>
          </View>
        )}

        {/* Court Information */}
        <View className="p-4">
          <Text className="text-2xl font-bold mb-2 text-gray-800">{court.courtName}</Text>
          <Text className="text-gray-600 mb-2">Type: {court.type}</Text>
          {court.description && (
            <Text className="text-gray-700 mb-4">{court.description}</Text>
          )}

          {/* Court Details */}
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Court Information</Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Price per Hour:</Text>
                <Text className="text-gray-800 font-medium">{formatPrice(court.pricePerHour)}</Text>
              </View>
              
              {court.capacity && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Capacity:</Text>
                  <Text className="text-gray-800 font-medium">{court.capacity} people</Text>
                </View>
              )}
              
              {court.surfaceType && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Surface:</Text>
                  <Text className="text-gray-800 font-medium">{court.surfaceType}</Text>
                </View>
              )}
              
              {court.isIndoor !== undefined && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Location:</Text>
                  <Text className="text-gray-800 font-medium">
                    {court.isIndoor ? 'Indoor' : 'Outdoor'}
                  </Text>
                </View>
              )}
              
              {court.isLighted && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Lighting:</Text>
                  <Text className="text-gray-800 font-medium">Available</Text>
                </View>
              )}
              
              {court.isAirConditioned && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Air Conditioning:</Text>
                  <Text className="text-gray-800 font-medium">Available</Text>
                </View>
              )}
            </View>
          </View>

          {/* Booking Information */}
          <View className="bg-orange-50 p-4 rounded-lg mb-6">
            <Text className="text-lg font-semibold text-orange-800 mb-3">Booking Information</Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-orange-700">Minimum Duration:</Text>
                <Text className="text-orange-800 font-medium">{court.minBookingDuration || 1} hour</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-orange-700">Maximum Duration:</Text>
                <Text className="text-orange-800 font-medium">{court.maxBookingDuration || 24} hours</Text>
              </View>
              
              {court.dynamicPricingEnabled && (
                <View className="bg-orange-100 p-3 rounded-lg mt-3">
                  <Text className="text-orange-800 text-sm text-center">
                    💡 This court has dynamic pricing based on time and demand
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Book Now Button */}
          <TouchableOpacity
            onPress={handleBookNow}
            className="bg-orange-500 p-4 rounded-lg"
          >
            <Text className="text-white text-center font-bold text-lg">Book Now</Text>
          </TouchableOpacity>

          {/* Additional Information */}
          {venue && (
            <View className="mt-6 bg-blue-50 p-4 rounded-lg">
              <Text className="text-lg font-semibold text-blue-800 mb-2">Venue Information</Text>
              <Text className="text-blue-700">{venue.name}</Text>
              <Text className="text-blue-700">{venue.address}</Text>
              {venue.contactNo && (
                <Text className="text-blue-700">Contact: {venue.contactNo}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
