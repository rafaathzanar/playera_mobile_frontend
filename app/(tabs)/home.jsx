import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, ScrollView } from "react-native";
import VenueCard from "../../components/VenueCard"; // Adjust path based on your file structure

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  
  const pickedForYouVenues = [
    {
      id: "1",
      name: "Colombo Futsal Club",
      address: "70 Galle Road, Dehiwala",
      contact: "077 969 4278",
      image: "https://example.com/futsal-image.jpg", 
      isOpen: true,
      closingTime: "12 AM",
    },
    {
      id: "2",
      name: "Royal Tennis Court",
      address: "123 Main Street, Colombo",
      contact: "077 111 2222",
      image: "https://example.com/tennis-image.jpg", 
      isOpen: false,
      closingTime: "10 PM",
    },
  ];

  const favoriteVenues = [
    {
      id: "3",
      name: "Elite Swimming Pool",
      address: "45 Park Avenue, Colombo",
      contact: "077 333 4444",
      image: "https://example.com/pool-image.jpg", 
      isOpen: true,
      closingTime: "9 PM",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Hello, John!</Text>
        <TextInput
          className="bg-white p-3 rounded-lg text-gray-700 border border-secondary"
          placeholder="Search for venues"
          placeholderTextColor="black" 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView>
        
        <View className="mt-4 px-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">Picked for You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {pickedForYouVenues.map((venue) => (
              <View key={venue.id} className="mr-4">
                <VenueCard
                  name={venue.name}
                  address={venue.address}
                  contact={venue.contact}
                  image={venue.image}
                  isOpen={venue.isOpen}
                  closingTime={venue.closingTime}
                />
              </View>
            ))}
          </ScrollView>
        </View>

      
        <View className="mt-4 px-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">Favorites</Text>
          {favoriteVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              name={venue.name}
              address={venue.address}
              contact={venue.contact}
              image={venue.image}
              isOpen={venue.isOpen}
              closingTime={venue.closingTime}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
