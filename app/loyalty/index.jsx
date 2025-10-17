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
      // Get customer ID from auth context or user profile
      const userProfile = await api.getUserProfile();
      const data = await api.getLoyaltyProfile(userProfile.userId);
      console.log('Loyalty data loaded:', data);
      setLoyaltyInfo(data);
    } catch (error) {
      console.error('Error loading loyalty info:', error);
      // Don't show alert, just set to null to show fallback message
      setLoyaltyInfo(null);
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
          '15% discount on all bookings',
          '5% Gold Coins per booking',
          'Priority customer support',
          'Free equipment rental (up to 2 hours)',
          'Exclusive venue access',
          'Monthly bonus points'
        ];
      case 'GOLD':
        return [
          '10% discount on all bookings',
          '4% Gold Coins per booking',
          'Priority customer support',
          'Free equipment rental (up to 1 hour)',
          'Advance booking (up to 60 days)'
        ];
      case 'SILVER':
        return [
          '5% discount on all bookings',
          '3% Gold Coins per booking',
          'Standard customer support',
          'Advance booking (up to 45 days)'
        ];
      case 'BRONZE':
        return [
          'No automatic discount',
          '2% Gold Coins per booking',
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
        <View className="bg-blue-500 p-6 mx-4 mt-4 rounded-lg">
          <View className="items-center">
            <View 
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: getTierColor(loyaltyInfo.currentTier || 'BRONZE') }}
            >
              <Ionicons 
                name="star" 
                size={40} 
                color={(loyaltyInfo.currentTier || 'BRONZE') === 'PLATINUM' ? '#000' : '#fff'} 
              />
            </View>
            <Text className="text-white text-2xl font-bold mb-2">
              {loyaltyInfo.currentTier || 'BRONZE'} TIER
            </Text>
            <Text className="text-white text-lg">
              {loyaltyInfo.currentPoints || 0} Points
            </Text>
            <Text className="text-white text-lg">
              🪙 {loyaltyInfo.goldCoins || 0} Gold Coins
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
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700">Tier Discount</Text>
              <Text className="text-green-600 font-bold">
                {((1 - loyaltyInfo.discountMultiplier) * 100).toFixed(0)}% OFF
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700">Gold Coins Available</Text>
              <Text className="text-yellow-600 font-bold">
                🪙 {loyaltyInfo.goldCoins} coins
              </Text>
            </View>
            <Text className="text-gray-500 text-sm mt-2">
              Tier discount is automatically applied. Gold coins can be redeemed for additional discounts (1 coin = 1 LKR).
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
                    <Text className="font-semibold">{transaction.displayName}</Text>
                    <Text className="text-gray-600 text-sm">{transaction.description}</Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center">
                      <Text className={`font-bold ${
                        transaction.pointsChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.pointsChange > 0 ? '+' : ''}{transaction.pointsChange} pts
                      </Text>
                      {transaction.goldCoinsChange !== 0 && (
                        <Text className={`ml-2 font-bold ${
                          transaction.goldCoinsChange > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {transaction.goldCoinsChange > 0 ? '+' : ''}{transaction.goldCoinsChange} 🪙
                        </Text>
                      )}
                    </View>
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
          <Text className="text-lg font-bold mb-4">How to Earn Rewards</Text>
          <View className="bg-yellow-50 rounded-lg p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar" size={20} color="#F59E0B" />
              <Text className="ml-2 font-semibold">Complete Bookings</Text>
            </View>
            <Text className="text-gray-700 mb-3">
              Earn 0.5 points + gold coins (based on tier) for every LKR 1 spent
            </Text>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text className="ml-2 font-semibold">Leave Reviews</Text>
            </View>
            <Text className="text-gray-700 mb-3">
              Earn 50 points + 10 gold coins for every review submitted
            </Text>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="trophy" size={20} color="#F59E0B" />
              <Text className="ml-2 font-semibold">Higher Tiers</Text>
            </View>
            <Text className="text-gray-700">
              Earn more gold coins as you progress through tiers (Bronze: 1x, Silver: 1.2x, Gold: 1.5x, Platinum: 2x)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


