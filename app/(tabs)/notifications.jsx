import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import NotificationItem from '../../components/NotificationItem';
import notificationService from '../../services/notificationService';

const { width, height } = Dimensions.get('window');

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      
      // Animate in the notifications
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.notificationId !== notificationId)
    );
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.notificationId === notificationId
          ? { ...notification, unread: false, status: 'READ' }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark All Read',
          onPress: async () => {
            try {
              await notificationService.markAllAsRead();
              setNotifications(prev =>
                prev.map(notification => ({
                  ...notification,
                  unread: false,
                  status: 'READ'
                }))
              );
            } catch (error) {
              console.error('Error marking all as read:', error);
              Alert.alert('Error', 'Failed to mark all notifications as read');
            }
          },
        },
      ]
    );
  };

  const renderNotification = ({ item }) => (
    <NotificationItem
      notification={item}
      onDelete={handleDeleteNotification}
      onMarkAsRead={handleMarkAsRead}
    />
  );

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <View style={styles.emptyIconBackground}>
          <Ionicons name="notifications-outline" size={48} color="#667eea" />
        </View>
      </View>
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptyMessage}>
        You have no new notifications.{'\n'}
        New updates will appear here.
      </Text>
    </Animated.View>
  );

  const unreadCount = notifications.filter(n => n.unread).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Animated.View style={[styles.loadingIcon, { opacity: fadeAnim }]}>
            <Ionicons name="notifications" size={32} color="#667eea" />
          </Animated.View>
          <Text style={styles.loadingText}>Loading notifications...</Text>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Ionicons name="checkmark-circle" size={20} color="#667eea" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {unreadCount > 0 && (
        <Animated.View 
          style={[
            styles.unreadBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.unreadBannerContent}>
            <Ionicons name="information-circle" size={20} color="#3182CE" />
            <Text style={styles.unreadText}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </Animated.View>
      )}

      <Animated.View 
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.notificationId.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#667eea"
              colors={['#667eea', '#764ba2']}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#1A202C',
    fontWeight: '600',
    marginBottom: 24,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },

  // Header Styles
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginRight: 12,
  },
  unreadBadge: {
    backgroundColor: '#FF4757',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  markAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Unread Banner Styles
  unreadBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  unreadBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unreadText: {
    marginLeft: 8,
    color: '#3182CE',
    fontSize: 14,
    fontWeight: '600',
  },

  // List Styles
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
});

export default NotificationsScreen;
