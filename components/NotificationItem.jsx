import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      case 'BOOKING_CONFIRMED':
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
      case 'BOOKING_CONFIRMED':
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
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getNotificationIcon(notification.type)}
              size={24}
              color={getNotificationColor(notification.type)}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              notification.unread && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.timeAgo}>
              {notification.timeAgo}
            </Text>
          </View>
          
          <View style={styles.rightContainer}>
            {notification.unread && (
              <View style={styles.unreadDot} />
            )}
            {showDeleteButton && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
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
    marginBottom: 8,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  rightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
});

export default NotificationItem;
