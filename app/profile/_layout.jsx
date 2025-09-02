import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="edit" 
        options={{ 
          headerShown: false,
          title: "Edit Profile"
        }} 
      />
      <Stack.Screen 
        name="change-password" 
        options={{ 
          headerShown: false,
          title: "Change Password"
        }} 
      />
      <Stack.Screen 
        name="booking-history" 
        options={{ 
          headerShown: false,
          title: "Booking History"
        }} 
      />
      <Stack.Screen 
        name="favourites" 
        options={{ 
          headerShown: false,
          title: "Favourite Venues"
        }} 
      />
    </Stack>
  );
}
