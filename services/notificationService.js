import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://172.20.10.2:8080/api";

class NotificationService {
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getUserId() {
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      return user.userId;
    }
    return null;
  }

  async getNotifications() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/notifications?userId=${userId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return 0;
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/notifications/unread-count?userId=${userId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const count = await response.json();
      return count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }

  async markAsRead(notificationId) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read?userId=${userId}`,
        {
          method: "PUT",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}?userId=${userId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const notifications = await this.getNotifications();
      const unreadNotifications = notifications.filter((n) => n.unread);

      const promises = unreadNotifications.map((notification) =>
        this.markAsRead(notification.notificationId)
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
}

export default new NotificationService();
