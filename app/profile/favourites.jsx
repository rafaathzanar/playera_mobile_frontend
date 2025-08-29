import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeartIcon, MapPinIcon, StarIcon } from 'react-native-heroicons/outline';
import api from '../../services/api';

export default function FavouriteVenues() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.getFavorites();
      setFavorites(response);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorite venues');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (venueId) => {
    try {
      await api.removeFromFavorites(venueId);
      setFavorites(favorites.filter(fav => fav.venueId !== venueId));
      Alert.alert('Success', 'Venue removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove venue from favorites');
    }
  };

  const renderVenueItem = ({ item }) => (
    <View style={styles.venueCard}>
      <Image 
        source={{ uri: item.venue.images?.[0] || 'https://via.placeholder.com/300x200' }} 
        style={styles.venueImage}
      />
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{item.venue.name}</Text>
        <View style={styles.locationContainer}>
          <MapPinIcon size={16} color="#666" />
          <Text style={styles.locationText}>{item.venue.address}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <StarIcon size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.venue.averageRating || 'N/A'}</Text>
        </View>
        <Text style={styles.priceText}>From ${item.venue.basePrice}/hour</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFavorite(item.venueId)}
      >
        <HeartIcon size={20} color="#FF4444" fill="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorite Venues</Text>
        <Text style={styles.subtitle}>{favorites.length} venues</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <HeartIcon size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Start exploring venues and add them to your favorites
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderVenueItem}
          keyExtractor={(item) => item.favoriteId.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
  },
  venueCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  venueInfo: {
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  removeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});


