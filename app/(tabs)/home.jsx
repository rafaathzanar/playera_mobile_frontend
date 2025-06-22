import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import VenueCard from "../../components/VenueCard";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data for "Picked for You" venues
  const pickedForYouVenues = [
    {
      id: "1",
      name: "Colombo Futsal Club",
      address: "70 Galle Road, Dehiwala",
      contact: "077 969 4278",
      image:
        "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg",
      isOpen: true,
      closingTime: "9 PM",
    },
    {
      id: "2",
      name: "Royal Tennis Court",
      address: "123 Main Street, Colombo 4",
      contact: "077 111 2222",
      image:
        "https://media.istockphoto.com/id/471621500/photo/tennis-court-with-tennis-ball-close-up.jpg?s=612x612&w=0&k=20&c=K4kHMI9lxAl2L_s6CfKdR_VOHWcjx6KDHXJNRN35myc=",
      isOpen: true,
      closingTime: "10 PM",
    },
  ];

  // Sample data for "Favorites" venues
  const favoriteVenues = [
    {
      id: "3",
      name: "Elite Swimming Pool",
      address: "45 Park Avenue, Colombo",
      contact: "077 333 4444",
      image:
        "https://salfordcommunityleisure.co.uk/wp-content/uploads/2021/07/Swim-For-All-WEB-2000x846.png",
      isOpen: true,
      closingTime: "9 PM",
    },
    {
      id: "4",
      name: "Summer Cricket Club",
      address: "45 Street Hammer, Colombo",
      contact: "077 555 444",
      image:
        "https://www.blenheimindoorsports.co.nz/assets/Matts-Photos/507ae5df5b/IndoorCricket1__ResizedImageWzY1MSw0MzVd.jpg",
      isOpen: true,
      closingTime: "9 PM",
    },
    {
      id: "5",
      name: "West Badminton Club",
      address: "45 Hills Road, Colombo",
      contact: "077 555 333",
      image:
        "https://media.istockphoto.com/id/691338554/photo/two-couples-playing-badminton.jpg?s=612x612&w=0&k=20&c=3y0Fhwq_fpyBAVZcVBjOqKO6C7nN8yAtAKLabk6KAfk=",
      isOpen: true,
      closingTime: "9 PM",
    },
  ];

  // Filter function to search venues by name or address
  const filterVenues = (venues) => {
    if (!searchQuery.trim()) return venues;
    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredPickedVenues = filterVenues(pickedForYouVenues);
  const filteredFavoriteVenues = filterVenues(favoriteVenues);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Greeting and Search */}
      <View className="p-4 bg-white">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Hello, Mohammed!
        </Text>
        <TextInput
          className="bg-white mt-6 p-3 rounded-lg text-gray-700 border border-black"
          placeholder="Search for venues"
          placeholderTextColor="black"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView>
        {/* Picked For You Section */}
        <View className="mt-4 px-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Picked for You
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredPickedVenues.map((venue) => (
              <View key={venue.id} className="mr-4">
                <VenueCard
                  onPress={() => router.push(`/venue/${venue.id}`)}
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

        {/* Favorites Section */}
        <View className="mt-4 mb-20 px-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Favorites
          </Text>
          {filteredFavoriteVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              onPress={() => router.push(`/venue/${venue.id}`)}
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
}
