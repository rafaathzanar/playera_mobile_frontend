import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function LoyaltyPage() {
  const router = useRouter();
  const [loyaltyInfo, setLoyaltyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoyaltyInfo();
  }, []);

  const loadLoyaltyInfo = async () => {
    try {
      setLoading(true);
      const data = await api.getLoyaltyInfo();
      setLoyaltyInfo(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load loyalty information');
      console.error('Error loading loyalty info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'PLATINUM':
        return '#E5E4E2';
      case 'GOLD':
        return '#FFD700';
      case 'SILVER':
        return '#C0C0C0';
      case 'BRONZE':
        return '#CD7F32';
      default:
        return '#C0C0C0';
    }
  };

  const getTierBenefits = (tier) => {
    switch (tier) {
      case 'PLATINUM':
        return [
          '20% discount on all bookings',
          'Priority customer support',
          'Free equipment rental (up to 2 hours)',
          'Exclusive venue access',
          'Monthly bonus points'
        ];
      case 'GOLD':
        return [
          '15% discount on all bookings',
          'Priority customer support',
          'Free equipment rental (up to 1 hour)',
          'Advance booking (up to 60 days)'
        ];
      case 'SILVER':
        return [
          '10% discount on all bookings',
          'Standard customer support',
          'Advance booking (up to 45 days)'
        ];
      case 'BRONZE':
        return [
          '5% discount on all bookings',
          'Standard customer support',
          'Advance booking (up to 30 days)'
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text>Loading loyalty information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!loyaltyInfo) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-gray-600 text-center">
            No loyalty information available. Start booking to earn points!
          </Text>
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
        <Text className="text-lg font-bold">Loyalty Program</Text>
        <View />
      </View>

      <ScrollView className="flex-1">
        {/* Current Tier Display */}
        <View className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 mx-4 mt-4 rounded-lg">
          <View className="items-center">
            <View 
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: getTierColor(loyaltyInfo.currentTier) }}
            >
              <Ionicons 
                name="star" 
                size={40} 
                color={loyaltyInfo.currentTier === 'PLATINUM' ? '#000' : '#fff'} 
              />
            </View>
            <Text className="text-white text-2xl font-bold mb-2">
              {loyaltyInfo.currentTier} TIER
            </Text>
            <Text className="text-white text-lg">
              {loyaltyInfo.currentPoints} Points
            </Text>
          </View>
        </View>

        {/* Points Progress */}
        <View className="p-4">
          <Text className="text-lg font-bold mb-4">Progress to Next Tier</Text>
          
          {loyaltyInfo.pointsToNextTier > 0 ? (
            <View className="bg-gray-100 rounded-lg p-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Current Points</Text>
                <Text className="font-semibold">{loyaltyInfo.currentPoints}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Next Tier</Text>
                <Text className="font-semibold">
                  {loyaltyInfo.currentTier === 'BRONZE' ? 'SILVER' : 
                   loyaltyInfo.currentTier === 'SILVER' ? 'GOLD' : 
                   loyaltyInfo.currentTier === 'GOLD' ? 'PLATINUM' : 'MAX TIER'}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Points Needed</Text>
                <Text className="font-semibold">{loyaltyInfo.pointsToNextTier}</Text>
              </View>
              
              <View className="bg-gray-200 rounded-full h-3 mt-2">
                <View 
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (loyaltyInfo.currentPoints / (loyaltyInfo.currentPoints + loyaltyInfo.pointsToNextTier)) * 100)}%` 
                  }}
                />
              </View>
            </View>
          ) : (
            <View className="bg-green-100 rounded-lg p-4">
              <Text className="text-green-800 text-center font-semibold">
                🎉 Congratulations! You've reached the highest tier!
              </Text>
            </View>
          )}
        </View>

        {/* Current Benefits */}
        <View className="p-4">
          <Text className="text-lg font-bold mb-4">Your Current Benefits</Text>
          <View className="bg-blue-50 rounded-lg p-4">
            {getTierBenefits(loyaltyInfo.currentTier).map((benefit, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-2 text-gray-700">{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Discount Information */}
        <View className="p-4">
          <Text className="text-lg font-bold mb-4">Discount Information</Text>
          <View className="bg-green-50 rounded-lg p-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Discount Multiplier</Text>
              <Text className="text-green-600 font-bold">
                {((1 - loyaltyInfo.discountMultiplier) * 100).toFixed(0)}% OFF
              </Text>
            </View>
            <Text className="text-gray-500 text-sm mt-2">
              This discount is automatically applied to all your bookings
            </Text>
          </View>
        </View>

        {/* Recent Transactions */}
        {loyaltyInfo.recentTransactions && loyaltyInfo.recentTransactions.length > 0 && (
          <View className="p-4">
            <Text className="text-lg font-bold mb-4">Recent Transactions</Text>
            <View className="bg-gray-50 rounded-lg p-4">
              {loyaltyInfo.recentTransactions.slice(0, 5).map((transaction, index) => (
                <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200">
                  <View>
                    <Text className="font-semibold">{transaction.type}</Text>
                    <Text className="text-gray-600 text-sm">{transaction.description}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`font-bold ${
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How to Earn Points */}
        <View className="p-4">
          <Text className="text-lg font-bold mb-4">How to Earn Points</Text>
          <View className="bg-yellow-50 rounded-lg p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar" size={20} color="#F59E0B" />
              <Text className="ml-2 font-semibold">Complete Bookings</Text>
            </View>
            <Text className="text-gray-700 mb-3">
              Earn 100 points for every completed booking
            </Text>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="card" size={20} color="#F59E0B" />
              <Text className="ml-2 font-semibold">Spend Money</Text>
            </View>
            <Text className="text-gray-700 mb-3">
              Earn 10 points for every LKR 1 spent
            </Text>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text className="ml-2 font-semibold">Leave Reviews</Text>
            </View>
            <Text className="text-gray-700">
              Earn 50 points for every review submitted
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


