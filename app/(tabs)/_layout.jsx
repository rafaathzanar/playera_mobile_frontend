import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { icons } from "../../constants";
import { Loader } from "../../components";
import notificationService from "../../services/notificationService";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const TabIcon = ({ icon, color, name, focused, badgeCount }) => {
  return (
    <View className="flex items-center justify-center gap-2 mt-5">
      <View style={{ position: 'relative' }}>
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={color}
          className="w-7 h-7"
        />
        {badgeCount > 0 && name === 'notifications' && (
          <View style={{
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: '#EF4444',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}>
            <Text style={{
              color: 'white',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const TabLayout = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user?.userId]);

  return (
    <>
      <Tabs
      
        screenOptions={{
         
          tabBarActiveTintColor: "#FF4B00",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute", 
            bottom:20,
            height: 75,
            backgroundColor: "#000000",
           
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
               
                focused={focused}
              
              />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.calendar}
                color={color}
               
                focused={focused}
               
              />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.notification}
                color={color}
                name="notifications"
                focused={focused}
                badgeCount={unreadCount}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="profile"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};
export default TabLayout;
