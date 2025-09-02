// import React, { useState } from "react";
// import { SafeAreaView, View, Text, Image, TouchableOpacity, Alert, Modal, Platform, KeyboardAvoidingView } from "react-native";
// import { useRouter } from "expo-router";
// import EditProfile from "../profile/edit"; // Adjust path as needed
// import ChangePassword from "../profile/change-password"; // Adjust path as needed

// export default function ProfileScreen() {
//   const router = useRouter();

//   const [user, setUser] = useState({
//     firstName: "Mohammed",
//     lastName: "Ali",
//     contactNumber: "Contact: 0771234567",
//     idNumber: "NIC: 123456789V",
//     profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7oMra0QkSp_Z-gShMOcCIiDF5gc_0VKDKDg&s",
//   });

//   const [isEditModalVisible, setEditModalVisible] = useState(false);
//   const [isChangePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

//   const handleEditProfile = () => {
//     setEditModalVisible(true);
//   };

//   const handleSaveProfile = (updatedUser) => {
//     setUser({
//       ...user,
//       firstName: updatedUser.firstName,
//       lastName: updatedUser.lastName,
//       contactNumber: `Contact: ${updatedUser.contactNumber}`,
//       idNumber: `NIC: ${updatedUser.idNumber}`,
//     });
//     setEditModalVisible(false);
//     Alert.alert("Success", "Profile updated successfully");
//   };

//   const handleChangePassword = () => {
//     setChangePasswordModalVisible(true);
//   };

//   const handleSavePassword = () => {
//     setChangePasswordModalVisible(false);
//     Alert.alert("Success", "Password changed successfully");
//   };

//   const handleDeleteAccount = () => {
//     Alert.alert(
//       "Delete Account",
//       "Are you sure you want to delete your account? This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => {
//             // Implement delete account API call here
//             Alert.alert("Account deleted");
//             router.replace("/(auth)/sign-in");
//           },
//         },
//       ]
//     );
//   };

//   const handleLogout = () => {
//     router.replace("/(auth)/sign-in");
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white p-6">
//       <View className="items-center mt-14">
//         <Image
//           source={{ uri: user.profilePicture }}
//           className="w-24 h-24 rounded-full border-2 border-gray-300"
//         />
//         <Text className="mt-4 text-2xl font-bold text-gray-800">
//           {user.firstName} {user.lastName}
//         </Text>
//         <Text className="text-gray-600">{user.contactNumber}</Text>
//         <Text className="text-gray-600">{user.idNumber}</Text>
//       </View>

//       <View className="mt-20 ml-4 mr-4 space-y-4">
//         <TouchableOpacity
//           onPress={handleEditProfile}
//           className="border border-orange-500 p-4 rounded-lg"
//         >
//           <Text className="text-orange-500 text-center font-bold">Edit Profile</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={handleChangePassword}
//           className="border border-orange-500 p-4 rounded-lg mt-4"
//         >
//           <Text className="text-orange-500 text-center font-bold">Change Password</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={handleDeleteAccount}
//           className="bg-red-500 p-4 mt-4 rounded-lg"
//         >
//           <Text className="text-white text-center font-bold">Delete Account</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={handleLogout}
//           className="bg-gray-500 p-4 mt-20 rounded-lg"
//         >
//           <Text className="text-white text-center font-bold">Logout</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Edit Profile Modal */}
//       <Modal
//         visible={isEditModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setEditModalVisible(false)}
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           className="flex-1"
//         >
//           <View className="flex-1 bg-black/50 justify-end">
//             <View className="bg-white rounded-t-3xl p-6 h-3/4">
//               <EditProfile
//                 user={{
//                   firstName: user.firstName,
//                   lastName: user.lastName,
//                   contactNumber: user.contactNumber.replace("Contact: ", ""),
//                   idNumber: user.idNumber.replace("NIC: ", ""),
//                 }}
//                 onSave={handleSaveProfile}
//                 onCancel={() => setEditModalVisible(false)}
//               />
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* Change Password Modal */}
//       <Modal
//         visible={isChangePasswordModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setChangePasswordModalVisible(false)}
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           className="flex-1"
//         >
//           <View className="flex-1 bg-black/50 justify-end">
//             <View className="bg-white rounded-t-3xl p-6 h-3/4">
//               <ChangePassword
//                 onSave={handleSavePassword}
//                 onCancel={() => setChangePasswordModalVisible(false)}
//               />
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "react-native-modal";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

// Importing local image as fallback
const defaultProfilePic = require("../../assets/dp.jpeg");

const ProfileScreen = () => {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: null,
  });
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Load user profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
    }, [])
  );

  // Sync with AuthContext user data when it changes
  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        profileImage: authUser.profileImage || null,
      });
    }
  }, [authUser]);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profileData = await api.getUserProfile();
      console.log("Profile data received:", profileData);
      
      // Update local state
      setUser({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        profileImage: profileData.profileImage || null,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      // If API fails, use AuthContext data as fallback
      if (authUser) {
        setUser({
          name: authUser.name || "",
          email: authUser.email || "",
          phone: authUser.phone || "",
          profileImage: authUser.profileImage || null,
        });
      } else {
        Alert.alert("Error", "Failed to load profile data");
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const toggleModal = () => {
    console.log("Toggling modal, current state:", isModalVisible);
    setModalVisible(!isModalVisible);
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.logout();
              await logout();
              // Use replace to prevent going back to profile
              router.replace("/(auth)/sign-in");
            } catch (error) {
              console.error("Logout error:", error);
              // Even if logout fails, clear local state and redirect
              await logout();
              router.replace("/(auth)/sign-in");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.deleteAccount();
              Alert.alert("Success", "Account deleted successfully", [
                {
                  text: "OK",
                  onPress: async () => {
                    await logout();
                    router.replace("/(auth)/sign-in");
                  },
                },
              ]);
            } catch (error) {
              console.error("Delete account error:", error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleBookingHistory = () => {
    router.push("/profile/booking-history");
  };

  const handleChangePassword = () => {
    router.push("/profile/change-password");
  };

  const menuItems = [
    {
      items: [
        {
          icon: "history",
          label: "Booking History",
          action: handleBookingHistory,
        },
        {
          icon: "lock",
          label: "Change Password",
          action: handleChangePassword,
        },
        {
          icon: "account-remove",
          label: "Delete Account",
          color: "#FF4B00",
          action: handleDeleteAccount,
        },
      ],
    },
  ];

  if (isLoadingProfile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF4B00" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image 
          source={user.profileImage ? { uri: user.profileImage } : defaultProfilePic} 
          style={styles.profileImage} 
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.name || "User"}</Text>
          <Text style={styles.email}>{user.email || ""}</Text>
          {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
          <TouchableOpacity
            style={[styles.editButton, isLoading && styles.disabledButton]}
            onPress={handleEditProfile}
            disabled={isLoading}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((section, index) => (
          <View key={index} style={styles.menuSection}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={`${index}-${itemIndex}`}
                style={[
                  styles.menuItem,
                  itemIndex === section.items.length - 1 && styles.lastMenuItem,
                ]}
                onPress={item.action}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  style={[styles.menuIcon, { color: item.color || "#000" }]}
                />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, isLoading && styles.disabledButton]}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <MaterialCommunityIcons
          name="logout"
          style={[styles.logoutIcon, isLoading && styles.disabledIcon]}
        />
        <Text style={[styles.logoutText, isLoading && styles.disabledText]}>
          {isLoading ? "Processing..." : "Log Out"}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: Platform.OS === "ios" ? 30 : 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "#D3D3D3",
    marginRight: 15,
  },
  profileInfo: {
    flexDirection: "column",
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#FF4B00",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  disabledButton: {
    backgroundColor: "#FFB299",
    opacity: 0.7,
  },
  editText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  menu: {
    borderRadius: 15,
  },
  menuSection: {
    marginBottom: 10,
    borderRadius: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  arrow: {
    fontSize: 20,
    color: "#999",
  },
  logoutButton: {
    flexDirection: "row",
    marginTop: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutIcon: {
    fontSize: 20,
    color: "#FF4B00",
    marginRight: 8,
  },
  logoutText: {
    color: "#666",
    fontWeight: "400",
    fontSize: 16,
  },
  disabledText: {
    color: "#999",
  },
  disabledIcon: {
    color: "#FFB299",
  },
});

export default ProfileScreen;