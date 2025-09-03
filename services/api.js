import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://172.20.10.2:8080/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from storage
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  // Set auth token in storage
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  // Remove auth token from storage
  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }

  // Get headers with auth token
  async getHeaders() {
    const token = await this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const headers = await this.getHeaders();
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, remove it
          await this.removeAuthToken();
          throw new Error("Authentication expired. Please login again.");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      const contentLength = response.headers.get("content-length");

      // If response is 204 No Content or has no content, return null
      if (
        response.status === 204 ||
        contentLength === "0" ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      await this.setAuthToken(response.token);
    }

    if (response.user) {
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.token) {
      await this.setAuthToken(response.token);
    }

    if (response.user) {
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));
    }

    return response;
  }

  async forgotPassword(email) {
    return await this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return await this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Venue APIs
  async getVenues(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/venues?${queryParams}` : "/venues";
    return await this.request(endpoint);
  }

  async getVenueById(id) {
    return await this.request(`/venues/${id}`);
  }

  async searchVenues(query, filters = {}) {
    const params = { ...filters, q: query };
    const queryParams = new URLSearchParams(params).toString();
    return await this.request(`/venues/search?${queryParams}`);
  }

  async getNearbyVenues(latitude, longitude, radius = 10) {
    return await this.request(
      `/venues/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
  }

  // Court APIs
  async getCourts(venueId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = venueId
      ? `/courts/venue/${venueId}?${queryParams}`
      : `/courts?${queryParams}`;
    return await this.request(endpoint);
  }

  async getCourtById(courtId) {
    return await this.request(`/courts/${courtId}`);
  }

  // Get dynamic pricing settings for a court
  async getDynamicPricingSettings(courtId) {
    return await this.request(`/courts/${courtId}/dynamic-pricing`);
  }

  async getCourtAvailability(courtId, date) {
    return await this.request(`/courts/${courtId}/availability?date=${date}`);
  }

  // Equipment APIs
  async getEquipment(courtId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = courtId
      ? `/equipment/court/${courtId}?${queryParams}`
      : `/equipment?${queryParams}`;
    return await this.request(endpoint);
  }

  async getEquipmentById(id) {
    return await this.request(`/equipment/${id}`);
  }

  async checkEquipmentAvailability(equipmentId, quantity) {
    return await this.request(
      `/equipment/${equipmentId}/availability?quantity=${quantity}`
    );
  }

  async calculateEquipmentCost(equipmentId, quantity, duration) {
    return await this.request(
      `/equipment/${equipmentId}/calculate-cost?quantity=${quantity}&duration=${duration}`
    );
  }

  // Booking APIs
  async createBooking(bookingData) {
    return await this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async createBookingWithPayment(bookingData) {
    return await this.request("/bookings/with-payment", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/bookings?${queryParams}` : "/bookings";
    return await this.request(endpoint);
  }

  async getBookingsByCustomer(customerId) {
    return await this.request(`/bookings/customer/${customerId}`);
  }

  async getBookingById(id) {
    return await this.request(`/bookings/${id}`);
  }

  async updateBooking(id, updateData) {
    return await this.request(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async cancelBooking(id) {
    return await this.request(`/bookings/${id}`, {
      method: "DELETE",
    });
  }

  // Slot APIs (Legacy - keeping for backward compatibility)
  async getAvailableSlots(courtId, date) {
    return await this.request(`/slots/available/${courtId}/date/${date}`);
  }

  async getAvailableSlotsByCourt(courtId) {
    return await this.request(`/slots/available/${courtId}`);
  }

  async checkSlotAvailability(courtId, date, startTime, endTime) {
    const params = new URLSearchParams({
      date: date,
      startTime: startTime,
      endTime: endTime,
    }).toString();
    return await this.request(`/slots/check-availability/${courtId}?${params}`);
  }

  async getCourtCalendar(courtId, startDate, endDate) {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate,
    }).toString();
    return await this.request(`/slots/calendar/${courtId}?${params}`);
  }

  // Time Slot APIs (New Dynamic System)
  async getAvailableTimeSlots(courtId, date) {
    let formattedDate;

    // Handle both Date objects and date strings
    if (date instanceof Date) {
      formattedDate = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    } else if (typeof date === "string") {
      // If it's already a string in YYYY-MM-DD format, use it directly
      formattedDate = date;
    } else {
      throw new Error(
        "Invalid date format. Expected Date object or string in YYYY-MM-DD format."
      );
    }

    return await this.request(
      `/timeslots/court/${courtId}/date/${formattedDate}`
    );
  }

  async getTimeSlotsForDateRange(courtId, startDate, endDate) {
    let start, end;

    // Handle both Date objects and date strings
    if (startDate instanceof Date) {
      start = startDate.toISOString().split("T")[0];
    } else if (typeof startDate === "string") {
      start = startDate;
    } else {
      throw new Error(
        "Invalid startDate format. Expected Date object or string in YYYY-MM-DD format."
      );
    }

    if (endDate instanceof Date) {
      end = endDate.toISOString().split("T")[0];
    } else if (typeof endDate === "string") {
      end = endDate;
    } else {
      throw new Error(
        "Invalid endDate format. Expected Date object or string in YYYY-MM-DD format."
      );
    }

    return await this.request(
      `/timeslots/court/${courtId}/range?startDate=${start}&endDate=${end}`
    );
  }

  async checkTimeSlotAvailability(courtId, date, startTime, endTime) {
    let formattedDate;

    // Handle both Date objects and date strings
    if (date instanceof Date) {
      formattedDate = date.toISOString().split("T")[0];
    } else if (typeof date === "string") {
      formattedDate = date;
    } else {
      throw new Error(
        "Invalid date format. Expected Date object or string in YYYY-MM-DD format."
      );
    }

    let start, end;

    // Handle both Time objects and time strings
    if (startTime instanceof Date) {
      start = startTime.toTimeString().split(" ")[0];
    } else if (typeof startTime === "string") {
      start = startTime;
    } else {
      throw new Error(
        "Invalid startTime format. Expected Date object or string in HH:MM:SS format."
      );
    }

    if (endTime instanceof Date) {
      end = endTime.toTimeString().split(" ")[0];
    } else if (typeof endTime === "string") {
      end = endTime;
    } else {
      throw new Error(
        "Invalid endTime format. Expected Date object or string in HH:MM:SS format."
      );
    }

    return await this.request(
      `/timeslots/court/${courtId}/availability?date=${formattedDate}&startTime=${start}&endTime=${end}`
    );
  }

  async getPeakHours(courtId) {
    return await this.request(`/timeslots/court/${courtId}/peak-hours`);
  }

  // Payment APIs
  async createPayment(paymentData) {
    return await this.request("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentById(id) {
    return await this.request(`/payments/${id}`);
  }

  async processRefund(paymentId, refundData) {
    return await this.request(`/payments/${paymentId}/refund`, {
      method: "POST",
      body: JSON.stringify(refundData),
    });
  }

  // Stripe Payment APIs
  async createPaymentIntent(paymentIntentData) {
    return await this.request("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify(paymentIntentData),
    });
  }

  async confirmPaymentIntent(paymentIntentId) {
    return await this.request(`/payments/confirm-intent/${paymentIntentId}`, {
      method: "POST",
    });
  }

  async getPaymentIntentStatus(paymentIntentId) {
    return await this.request(`/payments/intent/${paymentIntentId}`);
  }

  async cancelPaymentIntent(paymentIntentId) {
    return await this.request(`/payments/cancel-intent/${paymentIntentId}`, {
      method: "POST",
    });
  }

  // Review APIs
  async createReview(reviewData) {
    return await this.request("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  async getReviews(venueId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = venueId
      ? `/reviews/venue/${venueId}?${queryParams}`
      : `/reviews?${queryParams}`;
    return await this.request(endpoint);
  }

  async updateReview(id, updateData) {
    return await this.request(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  // Favorite APIs
  async addToFavorites(venueId, customerId) {
    return await this.request("/favorites", {
      method: "POST",
      body: JSON.stringify({ venueId, customerId }),
    });
  }

  async removeFromFavorites(venueId, customerId) {
    return await this.request(
      `/favorites/customer/${customerId}/venue/${venueId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getFavorites(customerId) {
    return await this.request(`/favorites/customer/${customerId}`);
  }

  async toggleFavorite(venueId, customerId) {
    return await this.request(
      `/favorites/toggle/customer/${customerId}/venue/${venueId}`,
      {
        method: "POST",
      }
    );
  }

  // Loyalty Program APIs
  async getLoyaltyInfo() {
    return await this.request("/loyalty/profile");
  }

  async redeemPoints(points, description) {
    return await this.request("/loyalty/redeem", {
      method: "POST",
      body: JSON.stringify({ points, description }),
    });
  }

  // User Profile APIs
  async getUserProfile() {
    return await this.request("/users/profile");
  }

  async updateUserProfile(profileData) {
    return await this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return await this.request("/users/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  }

  async deleteAccount() {
    return await this.request("/users/profile", {
      method: "DELETE",
    });
  }

  // Logout
  async logout() {
    await this.removeAuthToken();
    await AsyncStorage.removeItem("userData");
  }
}

export default new ApiService();
