import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

export default function VenueDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  
  // State
  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookedCourts, setBookedCourts] = useState(new Set());

  // Fetch venue and court data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);
        
        // Fetch venue details
        const venueData = await api.getVenueById(id);
        setVenue(venueData);
        
        // Fetch courts for this venue
        const courtsData = await api.getCourts(id);
        setCourts(courtsData);
        
        // Fetch equipment for this venue
        try {
          const equipmentData = await api.getEquipment(id);
          setEquipment(equipmentData || []);
        } catch (error) {
          console.log('No equipment found for this venue');
          setEquipment([]);
        }
        
      } catch (error) {
        console.error('Error fetching venue data:', error);
        Alert.alert('Error', 'Failed to load venue information');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenueData();
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-gray-600">Loading venue details...</Text>
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-xl text-red-500">Venue not found!</Text>
      </SafeAreaView>
    );
  }

  const toggleBook = (courtId) => {
    setBookedCourts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courtId)) {
        newSet.delete(courtId);
      } else {
        newSet.add(courtId);
      }
      return newSet;
    });
  };

  const handleCourtView = (courtId) => {
    router.push(`/venue/court/${courtId}`);
  };

  const handleCourtBook = (courtId) => {
    router.push({
      pathname: '/booking/slot-selection',
      params: {
        venueId: id,
        courtId: courtId
      }
    });
  };

  // Format price for display
  const formatPrice = (pricePerHour) => {
    if (!pricePerHour) return 'Price not available';
    return `LKR ${pricePerHour}/hour`;
  };

  // Format price with dynamic pricing indicator
  const formatPriceWithDynamic = (court) => {
    if (!court.pricePerHour) return 'Price not available';
    
    let priceText = `LKR ${court.pricePerHour}/hour`;
    
    if (court.dynamicPricingEnabled) {
      priceText += ' (Dynamic)';
    }
    
    return priceText;
  };

  // Get venue image
  const getVenueImage = (venue) => {
    if (venue.imageUrl) return venue.imageUrl;
    if (venue.images && venue.images.length > 0) return venue.images[0];
    return "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg";
  };

  // Get equipment for a specific court
  const getEquipmentForCourt = (courtId) => {
    return equipment.filter(eq => eq.courtId === courtId);
  };

  // Format equipment price
  const formatEquipmentPrice = (equipment) => {
    if (!equipment.ratePerHour) return 'Price not available';
    return `LKR ${equipment.ratePerHour}/hour`;
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
              VENUE DETAILS
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Venue Banner */}
        <Image 
          source={{ uri: getVenueImage(venue) }} 
          className="w-full h-48" 
          resizeMode="cover" 
        />

        {/* Venue Info */}
        <View className="p-4">
          <Text className="text-2xl font-bold mb-2">{venue.name}</Text>
          <Text className="text-gray-600">{venue.address}</Text>
          <Text className="text-gray-600">Contact: {venue.contactNo || 'Not available'}</Text>
          {venue.openingHours && (
            <Text className="text-gray-600">Hours: {venue.openingHours}</Text>
          )}
          {venue.description && (
            <Text className="mt-2 text-gray-700">{venue.description}</Text>
          )}
        </View>

        {/* Courts Listing */}
        <View className="p-4">
          <Text style={{ color: '#238AFF' }} className="text-xl font-semibold mb-4">
            COURTS ({courts.length})
          </Text>

          {/* Dynamic Pricing Info */}
          {courts.some(court => court.dynamicPricingEnabled) && (
            <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <Text className="text-orange-800 text-sm font-medium mb-1">
                💰 Dynamic Pricing Active
              </Text>
              <Text className="text-orange-700 text-xs">
                Prices may vary based on time, day, and demand. Peak hours and weekends may have higher rates.
              </Text>
            </View>
          )}

          {courts.length === 0 ? (
            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-center text-gray-600">No courts available for this venue</Text>
            </View>
          ) : (
            courts.map((court) => {
              const isBooked = bookedCourts.has(court.courtId);
              const courtEquipment = getEquipmentForCourt(court.courtId);

              return (
                <View
                  key={court.courtId}
                  className="mb-4 rounded-lg px-4 py-4"
                  style={{ backgroundColor: '#F1F3F5' }}
                >
                  {/* Court Info */}
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-800">{court.courtName}</Text>
                      <Text className="text-gray-600">{court.type}</Text>
                      <Text className="text-gray-600">{formatPriceWithDynamic(court)}</Text>
                      {court.surfaceType && (
                        <Text className="text-gray-600">Surface: {court.surfaceType}</Text>
                      )}
                      {court.capacity && (
                        <Text className="text-gray-600">Capacity: {court.capacity} people</Text>
                      )}
                      {court.description && (
                        <Text className="text-gray-600 text-sm mt-1">{court.description}</Text>
                      )}
                    </View>

                    <View className="flex-row gap-2 ml-4">
                      {/* View Button */}
                      <TouchableOpacity
                        onPress={() => handleCourtView(court.courtId)}
                        activeOpacity={0.8}
                        className="h-10 w-24 rounded-lg bg-white border border-orange-500 justify-center"
                      >
                        <Text className="text-orange-500 font-semibold text-center text-base">
                          View
                        </Text>
                      </TouchableOpacity>

                      {/* Book Button */}
                      <TouchableOpacity
                        onPress={() => handleCourtBook(court.courtId)}
                        activeOpacity={0.8}
                        className="h-10 w-24 rounded-lg bg-orange-500 border border-orange-500 justify-center"
                      >
                        <Text className="text-white font-semibold text-center text-base">
                          Book
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Equipment Section */}
                  {courtEquipment.length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-300">
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        🏀 Available Equipment ({courtEquipment.length})
                      </Text>
                      <View className="space-y-2">
                        {courtEquipment.map((eq) => (
                          <View key={eq.equipmentId} className="bg-white rounded-lg p-3 border border-gray-200">
                            <View className="flex-row justify-between items-start">
                              <View className="flex-1">
                                <Text className="font-medium text-gray-800">{eq.name}</Text>
                                {eq.description && (
                                  <Text className="text-sm text-gray-600">{eq.description}</Text>
                                )}
                                <View className="flex-row items-center mt-1">
                                  <Text className="text-sm text-gray-600">
                                    {eq.availableQuantity}/{eq.totalQuantity} available
                                  </Text>
                                  <Text className="text-sm text-gray-500 mx-2">•</Text>
                                  <Text className="text-sm text-gray-600">
                                    {formatEquipmentPrice(eq)}
                                  </Text>
                                </View>
                              </View>
                              <View className="ml-2">
                                <View className={`px-2 py-1 rounded-full ${
                                  eq.status === 'AVAILABLE' ? 'bg-green-100' : 
                                  eq.status === 'MAINTENANCE' ? 'bg-yellow-100' : 'bg-gray-100'
                                }`}>
                                  <Text className={`text-xs font-medium ${
                                    eq.status === 'AVAILABLE' ? 'text-green-800' : 
                                    eq.status === 'MAINTENANCE' ? 'text-yellow-800' : 'text-gray-800'
                                  }`}>
                                    {eq.status}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Equipment Summary */}
        {equipment.length > 0 && (
          <View className="p-4">
            <Text style={{ color: '#238AFF' }} className="text-xl font-semibold mb-4">
              EQUIPMENT RENTAL
            </Text>
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-800 text-sm font-medium mb-2">
                🎾 Equipment Available for Rent
              </Text>
              <Text className="text-blue-700 text-xs">
                All equipment can be added to your court booking. Equipment will be delivered to your court at the start of your session.
              </Text>
            </View>
          </View>
        )}

        {/* Additional Venue Information */}
        {venue.amenities && venue.amenities.length > 0 && (
          <View className="p-4">
            <Text style={{ color: '#238AFF' }} className="text-xl font-semibold mb-4">
              AMENITIES
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {venue.amenities.map((amenity, index) => (
                <View key={index} className="bg-orange-100 px-3 py-2 rounded-lg">
                  <Text className="text-orange-800 text-sm">{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
