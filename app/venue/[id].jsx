import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { ImageGallery } from '../../components';

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
        setCourts(courtsData || []);
        
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
      
        {/* Enhanced Venue Banner */}
        <View className="relative">
          <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}
              className="absolute top-12 left-4 z-10"
            >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Image Gallery */}
          <ImageGallery 
            images={venue.images || []} 
            height={256} 
            showDots={true}
          />
          
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-20" />
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-3xl font-bold mb-1">{venue.name}</Text>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-1">{venue.address}</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Venue Info */}
        <View className="p-6 bg-white">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-green-100 p-2 rounded-full mr-3">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-800">Open Now</Text>
                <Text className="text-sm text-gray-600">{venue.openingHours || 'Hours not available'}</Text>
              </View>
            </View>
            <View className="bg-blue-100 p-2 rounded-full">
              <Ionicons name="star" size={20} color="#3B82F6" />
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="bg-orange-100 p-2 rounded-full mr-3">
              <Ionicons name="call-outline" size={20} color="#F59E0B" />
            </View>
            <Text className="text-gray-700">{venue.contactNo || 'Contact not available'}</Text>
          </View>

          {venue.description && (
            <View className="bg-gray-50 p-4 rounded-xl">
              <Text className="text-gray-700 leading-6">{venue.description}</Text>
            </View>
          )}
        </View>

        {/* Enhanced Courts Section */}
        <View className="px-6 py-4">
          <View className="flex-row items-center mb-6">
            <View className="bg-blue-100 p-3 rounded-full mr-4">
              <Ionicons name="basketball-outline" size={24} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-gray-800">Available Courts</Text>
              <Text className="text-gray-600">{courts?.length || 0} courts available</Text>
            </View>
          </View>

          {/* Dynamic Pricing Info */}
          {courts.some(court => court.dynamicPricingEnabled) && (
            <View className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <View className="bg-orange-100 p-2 rounded-full mr-3">
                  <Ionicons name="trending-up" size={16} color="#F59E0B" />
                </View>
                <Text className="text-orange-800 text-base font-semibold">
                  Dynamic Pricing Active
                </Text>
              </View>
              <Text className="text-orange-700 text-sm leading-5">
                Prices may vary based on time, day, and demand. Peak hours and weekends may have higher rates.
              </Text>
            </View>
          )}

          {!courts || courts.length === 0 ? (
            <View className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <View className="items-center">
                <View className="bg-gray-200 p-4 rounded-full mb-4">
                  <Ionicons name="basketball-outline" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-center text-gray-600 text-lg">No courts available for this venue</Text>
              </View>
            </View>
          ) : (
            courts.map((court) => {
              const isBooked = bookedCourts.has(court.courtId);
              const courtEquipment = getEquipmentForCourt(court.courtId);

              return (
                <View
                  key={court.courtId}
                  style={{
                    marginBottom: 24,
                    backgroundColor: 'white',
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                    overflow: 'hidden',
                  }}
                >
                  {/* Court Header */}
                  <View style={{ 
                    backgroundColor: '#0e0e0ee3', 
                    padding: 16,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                          {court.courtName}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                          {court.type}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 }}>
                        <Ionicons name="basketball" size={24} color="white" />
                      </View>
                    </View>
                  </View>

                  {/* Court Details */}
                  <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <View style={{ backgroundColor: '#D1FAE5', padding: 4, borderRadius: 20, marginRight: 8 }}>
                            <Ionicons name="cash-outline" size={16} color="#10B981" />
                          </View>
                          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>{formatPriceWithDynamic(court)}</Text>
                        </View>
                        
                        {court.surfaceType && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View style={{ backgroundColor: '#DBEAFE', padding: 4, borderRadius: 20, marginRight: 8 }}>
                              <Ionicons name="layers-outline" size={16} color="#3B82F6" />
                            </View>
                            <Text style={{ color: '#6B7280' }}>{court.surfaceType}</Text>
                          </View>
                        )}
                        
                        {court.capacity && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View style={{ backgroundColor: '#FED7AA', padding: 4, borderRadius: 20, marginRight: 8 }}>
                              <Ionicons name="people-outline" size={16} color="#F59E0B" />
                            </View>
                            <Text style={{ color: '#6B7280' }}>{court.capacity} people</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {court.description && (
                      <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginBottom: 16 }}>
                        <Text style={{ color: '#374151', fontSize: 14, lineHeight: 20 }}>{court.description}</Text>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => handleCourtView(court.courtId)}
                        activeOpacity={0.8}
                        style={{ 
                          flex: 1, 
                          backgroundColor: 'white', 
                          borderWidth: 2, 
                          borderColor: '#3B82F6', 
                          borderRadius: 12, 
                          paddingVertical: 12, 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <Ionicons name="eye-outline" size={18} color="#3B82F6" />
                        <Text style={{ color: '#3B82F6', fontWeight: '600', marginLeft: 8 }}>View Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleCourtBook(court.courtId)}
                        activeOpacity={0.8}
                        style={{ 
                          flex: 1, 
                          backgroundColor: '#3B82F6', 
                          borderRadius: 12, 
                          paddingVertical: 12, 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <Ionicons name="calendar-outline" size={18} color="white" />
                        <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Enhanced Equipment Section */}
                  {courtEquipment.length > 0 && (
                    <View className="bg-gray-50 p-4">
                      <View className="flex-row items-center mb-3">
                        <View className="bg-purple-100 p-2 rounded-full mr-3">
                          <Ionicons name="fitness-outline" size={16} color="#8B5CF6" />
                        </View>
                        <Text className="text-base font-semibold text-gray-800">
                          Available Equipment ({courtEquipment.length})
                        </Text>
                      </View>
                      <View className="space-y-3">
                        {courtEquipment.map((eq) => (
                          <View key={eq.equipmentId} className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                            <View className="flex-row justify-between items-start">
                              <View className="flex-1">
                                <Text className="font-semibold text-gray-800 mb-1">{eq.name}</Text>
                                {eq.description && (
                                  <Text className="text-sm text-gray-600 mb-2">{eq.description}</Text>
                                )}
                                <View className="flex-row items-center">
                                  <View className="bg-blue-100 p-1 rounded-full mr-2">
                                    <Ionicons name="cube-outline" size={12} color="#3B82F6" />
                                  </View>
                                  <Text className="text-sm text-gray-600 mr-4">
                                    {eq.availableQuantity}/{eq.totalQuantity} available
                                  </Text>
                                  <View className="bg-green-100 p-1 rounded-full mr-2">
                                    <Ionicons name="cash-outline" size={12} color="#10B981" />
                                  </View>
                                  <Text className="text-sm text-gray-600">
                                    {formatEquipmentPrice(eq)}
                                  </Text>
                                </View>
                              </View>
                              <View className="ml-3">
                                <View className={`px-3 py-1 rounded-full ${
                                  eq.status === 'AVAILABLE' ? 'bg-green-100' : 
                                  eq.status === 'MAINTENANCE' ? 'bg-yellow-100' : 'bg-gray-100'
                                }`}>
                                  <Text className={`text-xs font-semibold ${
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

        {/* Enhanced Equipment Summary */}
        {equipment.length > 0 && (
          <View className="px-6 py-4">
            <View className="flex-row items-center mb-4">
              <View className="bg-purple-100 p-3 rounded-full mr-4">
                <Ionicons name="fitness" size={24} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-800">Equipment Rental</Text>
                <Text className="text-gray-600">Available for all courts</Text>
              </View>
            </View>
            <View className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-purple-100 p-2 rounded-full mr-3">
                  <Ionicons name="information-circle" size={16} color="#8B5CF6" />
                </View>
                <Text className="text-purple-800 text-base font-semibold">
                  Equipment Available for Rent
                </Text>
              </View>
              <Text className="text-purple-700 text-sm leading-5">
                All equipment can be added to your court booking. Equipment will be delivered to your court at the start of your session.
              </Text>
            </View>
          </View>
        )}

        {/* Enhanced Amenities Section */}
        {venue.amenities && venue.amenities.length > 0 && (
          <View className="px-6 py-4">
            <View className="flex-row items-center mb-4">
              <View className="bg-green-100 p-3 rounded-full mr-4">
                <Ionicons name="star" size={24} color="#10B981" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-800">Amenities</Text>
                <Text className="text-gray-600">What's included</Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {venue.amenities.map((amenity, index) => (
                <View key={index} className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-3 rounded-xl border border-green-200">
                  <Text className="text-green-800 text-sm font-semibold">{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
