import { Stack } from "expo-router";

export default function BookingLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="slot-selection" 
        options={{ 
          headerShown: false,
          title: "Select Time Slot"
        }} 
      />
      <Stack.Screen 
        name="checkout" 
        options={{ 
          headerShown: false,
          title: "Checkout"
        }} 
      />
      <Stack.Screen 
        name="order-summary" 
        options={{ 
          headerShown: false,
          title: "Order Summary"
        }} 
      />
      <Stack.Screen 
        name="payment" 
        options={{ 
          headerShown: false,
          title: "Payment"
        }} 
      />
    </Stack>
  );
}
