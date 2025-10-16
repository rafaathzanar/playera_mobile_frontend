import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import notificationService from '../services/notificationService';

const NotificationItem = ({ notification, onDelete, onMarkAsRead }) => {
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notification.notificationId);
              onDelete(notification.notificationId);
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  const handleMarkAsRead = async () => {
    if (notification.unread) {
      try {
        await notificationService.markAsRead(notification.notificationId);
        onMarkAsRead(notification.notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_BOOKED':
        return 'checkmark-circle';
      case 'BOOKING_REMINDER':
        return 'time';
      case 'BOOKING_CANCELLED':
        return 'close-circle';
      case 'VENUE_UPDATE':
        return 'business';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BOOKING_BOOKED':
        return '#10B981';
      case 'BOOKING_REMINDER':
        return '#F59E0B';
      case 'BOOKING_CANCELLED':
        return '#EF4444';
      case 'VENUE_UPDATE':
        return '#3B82F6';
      case 'SYSTEM_ANNOUNCEMENT':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.notificationCard,
          notification.unread && styles.unreadCard,
        ]}
        onPress={handleMarkAsRead}
        onLongPress={() => setShowDeleteButton(!showDeleteButton)}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: getNotificationColor(notification.type) + '20' }]}>
              <Ionicons
                name={getNotificationIcon(notification.type)}
                size={20}
                color={getNotificationColor(notification.type)}
              />
            </View>
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.title,
                notification.unread && styles.unreadTitle
              ]}>
                {notification.title}
              </Text>
              {notification.unread && (
                <View style={styles.unreadIndicator} />
              )}
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={12} color="#9CA3AF" />
              <Text style={styles.timeAgo}>
                {notification.timeAgo}
              </Text>
            </View>
          </View>
          
          <View style={styles.rightContainer}>
            {showDeleteButton && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <View style={styles.deleteBackground}>
                  <Ionicons name="trash" size={16} color="#FF5252" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    backgroundColor: '#FAFBFF',
    shadowColor: '#667eea',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 2,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#2D3748',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
    fontWeight: '500',
  },
  rightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  deleteButton: {
    borderRadius: 20,
  },
  deleteBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});

export default NotificationItem;
