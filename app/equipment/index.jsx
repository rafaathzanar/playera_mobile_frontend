import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function EquipmentPage() {
  const router = useRouter();
  const { venueId } = useLocalSearchParams();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  useEffect(() => {
    loadEquipment();
  }, [venueId]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await api.getEquipment(venueId);
      setEquipment(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load equipment');
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setSelectedEquipment(prev => {
      const existing = prev.find(e => e.equipmentId === item.equipmentId);
      if (existing) {
        return prev.map(e => 
          e.equipmentId === item.equipmentId 
            ? { ...e, quantity: e.quantity + 1 }
            : e
        );
      } else {
        return [...prev, { ...item, quantity: 1, duration: 1 }];
      }
    });
  };

  const removeFromCart = (equipmentId) => {
    setSelectedEquipment(prev => prev.filter(e => e.equipmentId !== equipmentId));
  };

  const updateQuantity = (equipmentId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(equipmentId);
      return;
    }
    
    setSelectedEquipment(prev => 
      prev.map(e => 
        e.equipmentId === equipmentId 
          ? { ...e, quantity }
          : e
      )
    );
  };

  const updateDuration = (equipmentId, duration) => {
    setSelectedEquipment(prev => 
      prev.map(e => 
        e.equipmentId === equipmentId 
          ? { ...e, duration }
          : e
      )
    );
  };

  const calculateTotal = () => {
    return selectedEquipment.reduce((total, item) => {
      return total + (item.ratePerHour * item.quantity * item.duration);
    }, 0);
  };

  const proceedToBooking = () => {
    if (selectedEquipment.length === 0) {
      Alert.alert('Error', 'Please select equipment to rent');
      return;
    }
    
    // Navigate to booking with equipment data
    router.push({
      pathname: '/booking/equipment-checkout',
      params: { 
        equipment: JSON.stringify(selectedEquipment),
        venueId 
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text>Loading equipment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Equipment Rental</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <Ionicons name="cart" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Equipment List */}
        <View className="p-4">
          <Text className="text-xl font-bold mb-4">Available Equipment</Text>
          
          {equipment.map((item) => (
            <View key={item.equipmentId} className="bg-gray-50 rounded-lg p-4 mb-4">
              <View className="flex-row items-center">
                <Image 
                  source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                  className="w-20 h-20 rounded-lg mr-4"
                />
                
                <View className="flex-1">
                  <Text className="text-lg font-semibold">{item.name}</Text>
                  <Text className="text-gray-600 mb-2">{item.description}</Text>
                  <Text className="text-green-600 font-bold">
                    LKR {item.ratePerHour}/hour
                  </Text>
                  <Text className="text-gray-500">
                    Available: {item.availableQuantity}/{item.totalQuantity}
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => addToCart(item)}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Selected Equipment Summary */}
        {selectedEquipment.length > 0 && (
          <View className="bg-blue-50 p-4 border-t border-blue-200">
            <Text className="text-lg font-bold mb-4">Selected Equipment</Text>
            
            {selectedEquipment.map((item) => (
              <View key={item.equipmentId} className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="font-semibold">{item.name}</Text>
                  <Text className="text-gray-600">
                    LKR {item.ratePerHour}/hour
                  </Text>
                </View>
                
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.equipmentId, item.quantity - 1)}
                    className="bg-red-500 w-8 h-8 rounded-full justify-center items-center"
                  >
                    <Text className="text-white font-bold">-</Text>
                  </TouchableOpacity>
                  
                  <Text className="mx-2">{item.quantity}</Text>
                  
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.equipmentId, item.quantity + 1)}
                    className="bg-green-500 w-8 h-8 rounded-full justify-center items-center"
                  >
                    <Text className="text-white font-bold">+</Text>
                  </TouchableOpacity>
                  
                  <Text className="mx-2">x {item.duration}h</Text>
                </View>
              </View>
            ))}
            
            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-lg font-bold">Total:</Text>
              <Text className="text-lg font-bold text-green-600">
                LKR {calculateTotal().toFixed(2)}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={proceedToBooking}
              className="bg-blue-500 p-4 rounded-lg mt-4"
            >
              <Text className="text-white text-center font-bold text-lg">
                Proceed to Booking
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


