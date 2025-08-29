import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import VenueCard from "../../components/VenueCard";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("football");
  const [venues, setVenues] = useState([]);
  const [favoriteVenues, setFavoriteVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load venues and favorites on component mount
  useEffect(() => {
    loadVenues();
    if (user?.userId) {
      loadFavorites();
    }
  }, [user]);

  // Function to get appropriate image for venue type
  const getVenueImage = (venue) => {
    // If venue has images, use the first one
    if (venue.images && venue.images.length > 0) {
      return venue.images[0];
    }
    
    // Otherwise, use dummy images based on venue type or description
    const description = venue.description?.toLowerCase() || '';
    const venueType = venue.venueType?.toLowerCase() || '';
    
    if (description.includes('basketball') || description.includes('indoor sports')) {
      return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop';
    } else if (description.includes('tennis')) {
      return 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop';
    } else if (description.includes('badminton') || description.includes('shuttle')) {
      return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop';
    } else if (description.includes('football') || description.includes('futsal')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop';
    } else if (description.includes('cricket')) {
      return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop';
    } else if (venueType.includes('indoor')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop';
    } else if (venueType.includes('outdoor')) {
      return 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop';
    } else {
      // Default sports facility image
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop';
    }
  };

  const loadVenues = async () => {
    try {
      setLoading(true);
      const response = await api.getVenues();
      console.log("Fetched venues:", response);
      
      // Handle paginated response structure
      const venuesData = response.content || response;
      console.log("Extracted venues data:", venuesData);
      
      if (Array.isArray(venuesData)) {
        setVenues(venuesData);
        // Debug: Log the first venue to see available fields
        if (venuesData.length > 0) {
          console.log("First venue object:", venuesData[0]);
          console.log("Available fields:", Object.keys(venuesData[0]));
        }
      } else {
        console.error("Venues data is not an array:", venuesData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load venues');
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      if (user?.userId) {
        const favoritesData = await api.getFavorites(user.userId);
        console.log('Raw favorites data:', favoritesData);
        
        // Extract venue IDs from favorites
        const venueIds = favoritesData.map(fav => fav.venueId);
        console.log('Venue IDs from favorites:', venueIds);
        
        // Get full venue details for each favorite
        const fullVenueDetails = [];
        for (const venueId of venueIds) {
          try {
            const venueDetail = await api.getVenueById(venueId);
            fullVenueDetails.push(venueDetail);
          } catch (error) {
            console.error(`Error fetching venue ${venueId}:`, error);
          }
        }
        
        console.log('Full venue details for favorites:', fullVenueDetails);
        setFavoriteVenues(fullVenueDetails);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Function to toggle favorite status
  const toggleFavorite = async (venue) => {
    try {
      if (!user?.userId) {
        Alert.alert('Error', 'Please login to manage favorites');
        return;
      }

      console.log('Toggling favorite for venue:', venue);
      console.log('User ID:', user.userId);
      console.log('Venue ID:', venue.venueId);

      // Use the backend's toggle endpoint
      const result = await api.toggleFavorite(venue.venueId, user.userId);
      console.log('Toggle result:', result);
      
      // Refresh favorites list
      await loadFavorites();
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', `Failed to update favorites: ${error.message}`);
    }
  };

  // Filter function to search venues by name or address
  const filterVenues = (venues) => {
    if (!searchQuery.trim()) return venues;
    return venues.filter(
      (venue) =>
        venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Filter venues by category
  const getVenuesByCategory = (category) => {
    if (!venues.length) return [];
    
    switch (category) {
      case 'football':
        return venues.filter(venue => 
          venue.venueType?.toLowerCase().includes('outdoor') || 
          venue.description?.toLowerCase().includes('football') ||
          venue.description?.toLowerCase().includes('futsal')
        );
      case 'shuttle':
        return venues.filter(venue => 
          venue.venueType?.toLowerCase().includes('indoor') || 
          venue.description?.toLowerCase().includes('badminton') || 
          venue.description?.toLowerCase().includes('shuttle')
        );
      case 'tennis':
        return venues.filter(venue => 
          venue.description?.toLowerCase().includes('tennis')
        );
      case 'cricket':
        return venues.filter(venue => 
          venue.description?.toLowerCase().includes('cricket')
        );
      default:
        return venues;
    }
  };

  const filteredFavoriteVenues = filterVenues(favoriteVenues);
  const filteredPickedVenues = selectedCategory
    ? filterVenues(getVenuesByCategory(selectedCategory))
    : filterVenues(venues);

  const categories = [
    { name: "football", icon: "football", label: "Football", iconType: "ionicons" },
    {
      name: "shuttle",
      icon: require("../../assets/icons/shuttle.png"), // Adjust path as needed
      label: "Shuttle",
      iconType: "image",
    },
    { name: "tennis", icon: "tennisball", label: "Tennis", iconType: "ionicons" },
    {
      name: "cricket",
      icon: require("../../assets/icons/cricket.png"), // Adjust path as needed
      label: "cricket",
      iconType: "image",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading venues...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Greeting and Search */}
      <View className="p-4 bg-white">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Hello,</Text>
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          {user?.name || 'Guest'}!
        </Text>
        <TextInput
          className="bg-white pl-10 pr-3 py-3 rounded-lg text-gray-700 border border-black"
          placeholder="Search venues by name, location"
          placeholderTextColor="black"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons
          name="search"
          size={20}
          color="black"
          style={{ position: 'absolute', top: 97, left: 23, zIndex: 1 }}
        />
      </View>

      <ScrollView>
        {/* Favorites Section */}
        <View className="mt-4 px-4">
          <Text className="text-lg font-bold text-gray-600 mb-2">FAVOURITES</Text>
          {!user?.userId ? (
            <Text className="text-gray-500 text-center py-4">Please login to see your favorite venues</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredFavoriteVenues.length > 0 ? (
                filteredFavoriteVenues.map((venue) => (
                  <View key={venue.venueId} className="mr-4">
                    <VenueCard
                      onPress={() => router.push(`/venue/${venue.venueId}`)}
                      name={venue.name}
                      address={venue.address}
                      contact={venue.contactNo}
                      image={getVenueImage(venue)}
                      isOpen={venue.status === 'ACTIVE'}
                      closingTime={venue.openingHours || '9 PM'}
                      isFavorite={favoriteVenues.some((fav) => fav.venueId === venue.venueId)}
                      onToggleFavorite={() => toggleFavorite(venue)}
                    />
                  </View>
                ))
              ) : (
                <Text className="text-gray-600">No favorite venues yet.</Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Picked For You Section with Category Buttons */}
        <View className="mt-4 px-4">
          <Text className="text-lg font-bold text-gray-600 mt-3 mb-4">
            PICKED FOR YOU
          </Text>
          <View className="flex-row justify-between items-center mb-4">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.name}
                className="mx-1"
                style={{
                  flex: selectedCategory === category.name ? 2 : 1,
                }}
                onPress={() =>
                  setSelectedCategory(
                    category.name === selectedCategory ? null : category.name
                  )
                }
              >
                <View
                  className={`flex-row items-center justify-center p-2 rounded-full ${
                    selectedCategory === category.name
                      ? "bg-black"
                      : "bg-gray-200"
                  }`}
                >
                  {category.iconType === "image" ? (
                    <Image
                      source={category.icon}
                      style={{
                        width: 22,
                        height: 22,
                        tintColor:
                          selectedCategory === category.name ? "white" : "black",
                      }}
                    />
                  ) : (
                    <Ionicons
                      name={category.icon}
                      size={20}
                      color={
                        selectedCategory === category.name ? "white" : "black"
                      }
                    />
                  )}
                  {selectedCategory === category.name && (
                    <Text className="text-sm text-white ml-2">
                      {category.label}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredPickedVenues.length > 0 ? (
              filteredPickedVenues.map((venue) => (
                <View key={venue.venueId} className="mr-4">
                  <VenueCard
                    onPress={() => router.push(`/venue/${venue.venueId}`)}
                    name={venue.name}
                    address={venue.address}
                    contact={venue.contactNo}
                    image={getVenueImage(venue)}
                    isOpen={venue.status === 'ACTIVE'}
                    closingTime={venue.openingHours || '9 PM'}
                    isFavorite={user?.userId ? favoriteVenues.some((fav) => fav.venueId === venue.venueId) : false}
                    onToggleFavorite={() => {
                      if (user?.userId) {
                        toggleFavorite(venue);
                      } else {
                        Alert.alert('Login Required', 'Please login to add venues to favorites');
                      }
                    }}
                  />
                </View>
              ))
            ) : (
              <Text className="text-gray-600">
                {selectedCategory
                  ? "No venues available for this category."
                  : "Select a category to view venues."}
              </Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}