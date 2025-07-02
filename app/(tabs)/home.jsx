// import React, { useState } from "react";
// import { SafeAreaView, View, Text, TextInput, ScrollView } from "react-native";
// import { useRouter } from "expo-router";
// import VenueCard from "../../components/VenueCard";
// import { Ionicons } from "@expo/vector-icons";
// export default function HomeScreen() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");

//   // Sample data for "Picked for You" venues
//   const pickedForYouVenues = [
//     {
//       id: "1",
//       name: "Colombo Futsal Club",
//       address: "70 Galle Road, Dehiwala",
//       contact: "077 969 4278",
//       image:
//         "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg",
//       isOpen: true,
//       closingTime: "9 PM",
//     },
//     {
//       id: "2",
//       name: "Royal Tennis Court",
//       address: "123 Main Street, Colombo 4",
//       contact: "077 111 2222",
//       image:
//         "https://media.istockphoto.com/id/471621500/photo/tennis-court-with-tennis-ball-close-up.jpg?s=612x612&w=0&k=20&c=K4kHMI9lxAl2L_s6CfKdR_VOHWcjx6KDHXJNRN35myc=",
//       isOpen: true,
//       closingTime: "10 PM",
//     },
//   ];

//   // Sample data for "Favorites" venues
//   const favoriteVenues = [
//     {
//       id: "3",
//       name: "Elite Swimming Pool",
//       address: "45 Park Avenue, Colombo",
//       contact: "077 333 4444",
//       image:
//         "https://salfordcommunityleisure.co.uk/wp-content/uploads/2021/07/Swim-For-All-WEB-2000x846.png",
//       isOpen: true,
//       closingTime: "9 PM",
//     },
//     {
//       id: "4",
//       name: "Summer Cricket Club",
//       address: "45 Street Hammer, Colombo",
//       contact: "077 555 444",
//       image:
//         "https://www.blenheimindoorsports.co.nz/assets/Matts-Photos/507ae5df5b/IndoorCricket1__ResizedImageWzY1MSw0MzVd.jpg",
//       isOpen: true,
//       closingTime: "9 PM",
//     },
//     {
//       id: "5",
//       name: "West Badminton Club",
//       address: "45 Hills Road, Colombo",
//       contact: "077 555 333",
//       image:
//         "https://media.istockphoto.com/id/691338554/photo/two-couples-playing-badminton.jpg?s=612x612&w=0&k=20&c=3y0Fhwq_fpyBAVZcVBjOqKO6C7nN8yAtAKLabk6KAfk=",
//       isOpen: true,
//       closingTime: "9 PM",
//     },
//   ];

//   // Filter function to search venues by name or address
//   const filterVenues = (venues) => {
//     if (!searchQuery.trim()) return venues;
//     return venues.filter(
//       (venue) =>
//         venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         venue.address.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   };

//   const filteredPickedVenues = filterVenues(pickedForYouVenues);
//   const filteredFavoriteVenues = filterVenues(favoriteVenues);

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       {/* Greeting and Search */}
//       <View className="p-4 bg-white">
//         <Text className="text-2xl font-bold text-gray-800 mb-2">
//           Hello, 
//         </Text>
//          <Text className="text-3xl font-bold text-gray-800 mb-2">
//            Mohammed!
//         </Text>

//         <TextInput
//     className="bg-white pl-10 pr-3 py-3 rounded-lg text-gray-700 border border-black"
//     placeholder="Search venues by name, location"
//     placeholderTextColor="black"
//     value={searchQuery}
//     onChangeText={setSearchQuery}
//   />

//   {/* Icon positioned inside the TextInput */}
//   <Ionicons
//     name="search"
//     size={20}
//     color="black"
//     style={{
//       position: 'absolute',
//       top: 97,
//       left: 23,
//       zIndex: 1,
//     }}
//   />
//       </View>

//       <ScrollView>
//         {/* Picked For You Section */}
//         <View className="mt-4 px-4">
//           <Text className="text-lg font-bold text-gray-800 mb-2">
//             Picked for You
//           </Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {filteredPickedVenues.map((venue) => (
//               <View key={venue.id} className="mr-4">
//                 <VenueCard
//                   onPress={() => router.push(`/venue/${venue.id}`)}
//                   name={venue.name}
//                   address={venue.address}
//                   contact={venue.contact}
//                   image={venue.image}
//                   isOpen={venue.isOpen}
//                   closingTime={venue.closingTime}
//                 />
//               </View>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Favorites Section */}
//         <View className="mt-4 mb-20 px-4">
//           <Text className="text-lg font-bold text-gray-800 mb-2">
//             Favorites
//           </Text>
//           {filteredFavoriteVenues.map((venue) => (
//             <VenueCard
//               key={venue.id}
//               onPress={() => router.push(`/venue/${venue.id}`)}
//               name={venue.name}
//               address={venue.address}
//               contact={venue.contact}
//               image={venue.image}
//               isOpen={venue.isOpen}
//               closingTime={venue.closingTime}
//             />
//           ))}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
// import React, { useState } from "react";
// import { SafeAreaView, View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
// import { useRouter } from "expo-router";
// import VenueCard from "../../components/VenueCard";
// import { Ionicons } from "@expo/vector-icons";

// export default function HomeScreen() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   // Sample data categorized by sport
//   const venuesData = {
//     football: [
//       {
//         id: "1",
//         name: "Colombo Futsal Club",
//         address: "70 Galle Road, Dehiwala",
//         contact: "077 969 4278",
//         image: "https://t4.ftcdn.net/jpg/09/09/73/81/360_F_909738157_hkL2e79FofzkMcEy9DUiIHe3HrHX4jJP.jpg",
//         isOpen: true,
//         closingTime: "9 PM",
//       },
//     ],
//     shuttle: [
//       {
//         id: "5",
//         name: "West Badminton Club",
//         address: "45 Hills Road, Colombo",
//         contact: "077 555 333",
//         image: "https://media.istockphoto.com/id/691338554/photo/two-couples-playing-badminton.jpg?s=612x612&w=0&k=20&c=3y0Fhwq_fpyBAVZcVBjOqKO6C7nN8yAtAKLabk6KAfk=",
//         isOpen: true,
//         closingTime: "9 PM",
//       },
//     ],
//     tennis: [
//       {
//         id: "2",
//         name: "Royal Tennis Court",
//         address: "123 Main Street, Colombo 4",
//         contact: "077 111 2222",
//         image: "https://media.istockphoto.com/id/471621500/photo/tennis-court-with-tennis-ball-close-up.jpg?s=612x612&w=0&k=20&c=K4kHMI9lxAl2L_s6CfKdR_VOHWcjx6KDHXJNRN35myc=",
//         isOpen: true,
//         closingTime: "10 PM",
//       },
//     ],
//     cricket: [
//       {
//         id: "4",
//         name: "Summer Cricket Club",
//         address: "45 Street Hammer, Colombo",
//         contact: "077 555 444",
//         image: "https://www.blenheimindoorsports.co.nz/assets/Matts-Photos/507ae5df5b/IndoorCricket1__ResizedImageWzY1MSw0MzVd.jpg",
//         isOpen: true,
//         closingTime: "9 PM",
//       },
//     ],
//   };

//   // Sample data for "Favorites" venues
//   const favoriteVenues = [
//     {
//       id: "3",
//       name: "Elite Swimming Pool",
//       address: "45 Park Avenue, Colombo",
//       contact: "077 333 4444",
//       image: "https://salfordcommunityleisure.co.uk/wp-content/uploads/2021/07/Swim-For-All-WEB-2000x846.png",
//       isOpen: true,
//       closingTime: "9 PM",
//     },
//     {
//       id: "2",
//       name: "Royal Tennis Court",
//       address: "123 Main Street, Colombo 4",
//       contact: "077 111 2222",
//       image: "https://media.istockphoto.com/id/471621500/photo/tennis-court-with-tennis-ball-close-up.jpg?s=612x612&w=0&k=20&c=K4kHMI9lxAl2L_s6CfKdR_VOHWcjx6KDHXJNRN35myc=",
//       isOpen: true,
//       closingTime: "10 PM",
//     },
//     {
//       id: "5",
//       name: "West Badminton Club",
//       address: "45 Hills Road, Colombo",
//       contact: "077 555 333",
//       image: "https://media.istockphoto.com/id/691338554/photo/two-couples-playing-badminton.jpg?s=612x612&w=0&k=20&c=3y0Fhwq_fpyBAVZcVBjOqKO6C7nN8yAtAKLabk6KAfk=",
//       isOpen: true,
//       closingTime: "9 PM",
//     },
//   ];

//   // Filter function to search venues by name or address
//   const filterVenues = (venues) => {
//     if (!searchQuery.trim()) return venues;
//     return venues.filter(
//       (venue) =>
//         venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         venue.address.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   };

//   const filteredFavoriteVenues = filterVenues(favoriteVenues);
//   const filteredPickedVenues = selectedCategory ? filterVenues(venuesData[selectedCategory]) : [];

//   const categories = [
//     { name: "football", icon: "football", label: "Football" },
//     { name: "shuttle", icon: "tennisball", label: "Shuttle" },
//     { name: "tennis", icon: "tennisball", label: "Tennis" },
//     { name: "cricket", icon: "baseball", label: "Cricket" },
//   ];

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       {/* Greeting and Search */}
//       <View className="p-4 bg-white">
//         <Text className="text-2xl font-bold text-gray-800 mb-2">Hello,</Text>
//         <Text className="text-3xl font-bold text-gray-800 mb-2">Mohammed!</Text>
//         <TextInput
//           className="bg-white pl-10 pr-3 py-3 rounded-lg text-gray-700 border border-black"
//           placeholder="Search venues by name, location"
//           placeholderTextColor="black"
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//         <Ionicons
//           name="search"
//           size={20}
//           color="black"
//           style={{ position: 'absolute', top: 97, left: 23, zIndex: 1 }}
//         />
//       </View>

//       <ScrollView>
//         {/* Favorites Section */}
//         <View className="mt-4 px-4">
//           <Text className="text-lg font-bold text-gray-600 mb-2">FAVOURITES</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {filteredFavoriteVenues.map((venue) => (
//               <View key={venue.id} className="mr-4">
//                 <VenueCard
//                   onPress={() => router.push(`/venue/${venue.id}`)}
//                   name={venue.name}
//                   address={venue.address}
//                   contact={venue.contact}
//                   image={venue.image}
//                   isOpen={venue.isOpen}
//                   closingTime={venue.closingTime}
//                 />
//               </View>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Picked For You Section with Category Buttons */}
//         <View className="mt-4 px-4">
//           <Text className="text-lg font-bold text-gray-600 mb-4">PICKED FOR YOU</Text>
//   <View className="flex-row justify-between items-center mb-4 px-4">
//   {categories.map((category) => (
//     <TouchableOpacity
//       key={category.name}
//       className="mx-1"
//       style={{
//         flex: selectedCategory === category.name ? 2 : 1, // only selected is wider
//       }}
//       onPress={() =>
//         setSelectedCategory(
//           category.name === selectedCategory ? null : category.name
//         )
//       }
//     >
//       <View
//         className={`flex-row items-center justify-center p-2 rounded-full ${
//           selectedCategory === category.name ? 'bg-black' : 'bg-gray-200'
//         }`}
//       >
//         <Ionicons
//           name={category.icon}
//           size={20}
//           color={selectedCategory === category.name ? 'white' : 'black'}
//         />
//         {selectedCategory === category.name && (
//           <Text className="text-sm text-white ml-2">{category.label}</Text>
//         )}
//       </View>
//     </TouchableOpacity>
//   ))}
// </View>


//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {filteredPickedVenues.map((venue) => (
//               <View key={venue.id} className="mr-4">
//                 <VenueCard
//                   onPress={() => router.push(`/venue/${venue.id}`)}
//                   name={venue.name}
//                   address={venue.address}
//                   contact={venue.contact}
//                   image={venue.image}
//                   isOpen={venue.isOpen}
//                   closingTime={venue.closingTime}
//                 />
//               </View>
//             ))}
//           </ScrollView>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }


import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import VenueCard from "../../components/VenueCard";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("football");

  const [favoriteVenues, setFavoriteVenues] = useState([
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
      id: "2",
      name: "Royal Tennis Court",
      address: "123 Main Street, Colombo 4",
      contact: "077 111 2222",
      image:
        "https://media.istockphoto.com/id/471621500/photo/tennis-court-with-tennis-ball-close-up.jpg?s=612x612&w=0&k=20&c=K4kHMI9lxAl2L_s6CfKdR_VOHWcjx6KDHXJNRN35myc=",
      isOpen: true,
      closingTime: "10 PM",
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
  ]);

  // Sample data categorized by sport
  const venuesData = {
    football: [
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
    ],
    shuttle: [
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
    ],
    tennis: [
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
    ],
    cricket: [
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
    ],
  };

  // Function to toggle favorite status
  const toggleFavorite = (venue) => {
    setFavoriteVenues((prevFavorites) => {
      const isAlreadyFavorite = prevFavorites.some((fav) => fav.id === venue.id);
      if (isAlreadyFavorite) {
        // Remove from favorites
        return prevFavorites.filter((fav) => fav.id !== venue.id);
      } else {
        // Add to favorites, ensuring no duplicates
        return [...prevFavorites, { ...venue }];
      }
    });
  };

  // Filter function to search venues by name or address
  const filterVenues = (venues) => {
    if (!searchQuery.trim()) return venues;
    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredFavoriteVenues = filterVenues(favoriteVenues);
  const filteredPickedVenues = selectedCategory
    ? filterVenues(venuesData[selectedCategory])
    : [];

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Greeting and Search */}
   
      <View className="p-4 bg-white">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Hello,</Text>
        <Text className="text-3xl font-bold text-gray-800 mb-2">Mohammed!</Text>
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
          style={{ position: "absolute", top: 97, left: 23, zIndex: 1 }}
        />
      </View>

      <ScrollView>
        {/* Favorites Section */}
        <View className="mt-4 px-4">
          <Text className="text-lg font-bold text-gray-600 mb-2">FAVOURITES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredFavoriteVenues.length > 0 ? (
              filteredFavoriteVenues.map((venue) => (
                <View key={venue.id} className="mr-4">
                  <VenueCard
                    onPress={() => router.push(`/venue/${venue.id}`)}
                    name={venue.name}
                    address={venue.address}
                    contact={venue.contact}
                    image={venue.image}
                    isOpen={venue.isOpen}
                    closingTime={venue.closingTime}
                    isFavorite={favoriteVenues.some((fav) => fav.id === venue.id)}
                    onToggleFavorite={() => toggleFavorite(venue)}
                  />
                </View>
              ))
            ) : (
              <Text className="text-gray-600">No favorite venues yet.</Text>
            )}
          </ScrollView>
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
                <View key={venue.id} className="mr-4">
                  <VenueCard
                    onPress={() => router.push(`/venue/${venue.id}`)}
                    name={venue.name}
                    address={venue.address}
                    contact={venue.contact}
                    image={venue.image}
                    isOpen={venue.isOpen}
                    closingTime={venue.closingTime}
                    isFavorite={favoriteVenues.some((fav) => fav.id === venue.id)}
                    onToggleFavorite={() => toggleFavorite(venue)}
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