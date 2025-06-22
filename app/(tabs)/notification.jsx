import React from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function NotificationScreen() {
  const notifications = [
    {
      id: "1",
      title: "Booking Confirmed!",
      message: "Your booking for Futsal Arena on February 10, 2025, at 18:00 has been confirmed.",
      time: "12:15 PM",
    },
    {
      id: "2",
      title: "Payment Successful",
      message: "Your payment of LKR 1240 for Booking ID #123456 has been processed.",
      time: "12:15 PM",
    },
    {
      id: "3",
      title: "Booking Canceled",
      message: "Your booking for Badminton Court on February 11, 2025, at 17:00 has been canceled.",
      time: "12:15 PM",
    },
    {
      id: "4",
      title: "Upcoming Booking Reminder",
      message: "Reminder: You have a booking at Cricket Ground tomorrow at 14:00. Get ready!",
      time: "12:15 PM",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Icon name="bell" size={24} color="#FF4B00" />
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#FF4B00" },
  notificationCard: { backgroundColor: "white", padding: 10, borderRadius: 8, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
  notificationTitle: { fontSize: 16, fontWeight: "bold" },
  notificationMessage: { fontSize: 14, color: "gray" },
  notificationTime: { fontSize: 12, color: "gray", marginTop: 5 },
});
