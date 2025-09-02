import { Stack } from "expo-router";

export default function VenueLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: false,
          title: "Venue Details"
        }} 
      />
      <Stack.Screen 
        name="court/[courtId]" 
        options={{ 
          headerShown: false,
          title: "Court Details"
        }} 
      />
    </Stack>
  );
}
