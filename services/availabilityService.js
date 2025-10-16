import AsyncStorage from "@react-native-async-storage/async-storage";

class AvailabilityService {
  constructor(baseURL = "http://192.168.1.159:8080/api") {
    // Match your existing API URL
    this.baseURL = baseURL;
    this.activeReservations = new Map();
    this.checkInterval = null;
  }

  // Get auth token from storage (same as ApiService)
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async checkAvailability(
    courtId,
    date,
    startTime,
    endTime,
    customerId = null
  ) {
    try {
      const params = new URLSearchParams({
        courtId: courtId.toString(),
        date: date,
        startTime: startTime,
        endTime: endTime,
      });

      if (customerId) {
        params.append("customerId", customerId);
      }

      // Get auth token
      const authToken = await this.getAuthToken();
      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `${this.baseURL}/availability/check?${params}`,
        {
          signal: controller.signal,
          headers: headers,
        }
      );

      clearTimeout(timeoutId);

      // Check if endpoint exists (404 means endpoint not implemented yet)
      if (response.status === 404) {
        console.log(
          "Availability endpoint not implemented yet, falling back to original behavior"
        );
        return { available: true, fallback: true }; // Allow fallback to original behavior
      }

      // Check if user is not authenticated (401 means unauthorized)
      if (response.status === 401) {
        console.log(
          "User not authenticated for availability check, falling back to original behavior"
        );
        return { available: true, fallback: true }; // Allow fallback to original behavior
      }

      // Check if user doesn't have permission (403 means forbidden)
      if (response.status === 403) {
        console.log(
          "User not authorized for availability check, falling back to original behavior"
        );
        return { available: true, fallback: true }; // Allow fallback to original behavior
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking availability:", error);
      if (error.name === "AbortError") {
        return { available: false, error: "Request timed out" };
      }
      return { available: false, error: error.message };
    }
  }

  async reserveTimeSlot(courtId, date, startTime, endTime, customerId) {
    try {
      const params = new URLSearchParams({
        courtId: courtId.toString(),
        date: date,
        startTime: startTime,
        endTime: endTime,
        customerId: customerId,
      });

      // Get auth token
      const authToken = await this.getAuthToken();
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.baseURL}/availability/reserve`, {
        method: "POST",
        headers: headers,
        body: params,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if endpoint exists (404 means endpoint not implemented yet)
      if (response.status === 404) {
        console.log(
          "Reservation endpoint not implemented yet, falling back to original behavior"
        );
        return { success: false, fallback: true }; // Allow fallback to original behavior
      }

      // Check if user is not authenticated (401 means unauthorized)
      if (response.status === 401) {
        console.log(
          "User not authenticated for reservation, falling back to original behavior"
        );
        return { success: false, fallback: true }; // Allow fallback to original behavior
      }

      // Check if user doesn't have permission (403 means forbidden)
      if (response.status === 403) {
        console.log(
          "User not authorized for reservation, falling back to original behavior"
        );
        return { success: false, fallback: true }; // Allow fallback to original behavior
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const reservationKey = `${courtId}-${date}-${startTime}-${endTime}`;
        this.activeReservations.set(reservationKey, {
          reservationId: data.reservationId,
          expiresAt: new Date(data.expiresAt),
          courtId,
          date,
          startTime,
          endTime,
        });

        this.startReservationMonitoring();
      }

      return data;
    } catch (error) {
      console.error("Error reserving time slot:", error);
      if (error.name === "AbortError") {
        return { success: false, error: "Request timed out" };
      }
      return { success: false, error: error.message };
    }
  }

  async cancelReservation(reservationId) {
    try {
      // Get auth token
      const authToken = await this.getAuthToken();
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${this.baseURL}/availability/cancel-reservation`,
        {
          method: "POST",
          headers: headers,
          body: new URLSearchParams({
            reservationId: reservationId.toString(),
          }),
        }
      );

      const data = await response.json();

      for (const [key, reservation] of this.activeReservations.entries()) {
        if (reservation.reservationId === reservationId) {
          this.activeReservations.delete(key);
          break;
        }
      }

      return data;
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      return { success: false, error: error.message };
    }
  }

  startReservationMonitoring() {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      const now = new Date();
      const expiredReservations = [];

      for (const [key, reservation] of this.activeReservations.entries()) {
        if (now > reservation.expiresAt) {
          expiredReservations.push({ key, reservation });
        }
      }

      // Remove expired reservations
      expiredReservations.forEach(({ key }) => {
        this.activeReservations.delete(key);
      });

      // Notify about expired reservations
      if (expiredReservations.length > 0) {
        this.onReservationExpired(
          expiredReservations.map((r) => r.reservation)
        );
      }

      if (this.activeReservations.size === 0) {
        this.stopReservationMonitoring();
      }
    }, 30000);
  }

  stopReservationMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getActiveReservations() {
    return Array.from(this.activeReservations.values());
  }

  isReservedByClient(courtId, date, startTime, endTime) {
    const reservationKey = `${courtId}-${date}-${startTime}-${endTime}`;
    return this.activeReservations.has(reservationKey);
  }

  onReservationExpired(expiredReservations) {
    console.warn("Reservations expired:", expiredReservations);
    //todo Implement UI notification logic here
  }

  cleanup() {
    this.stopReservationMonitoring();
    this.activeReservations.clear();
  }
}

// React hook for availability checking
function useAvailabilityCheck() {
  const [availabilityService] = useState(() => new AvailabilityService());
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const checkAvailability = useCallback(
    async (courtId, date, startTime, endTime, customerId) => {
      setIsChecking(true);
      try {
        const result = await availabilityService.checkAvailability(
          courtId,
          date,
          startTime,
          endTime,
          customerId
        );
        setLastCheck(result);
        return result;
      } finally {
        setIsChecking(false);
      }
    },
    [availabilityService]
  );

  const reserveSlot = useCallback(
    async (courtId, date, startTime, endTime, customerId) => {
      return await availabilityService.reserveTimeSlot(
        courtId,
        date,
        startTime,
        endTime,
        customerId
      );
    },
    [availabilityService]
  );

  const cancelReservation = useCallback(
    async (reservationId) => {
      return await availabilityService.cancelReservation(reservationId);
    },
    [availabilityService]
  );

  useEffect(() => {
    return () => {
      availabilityService.cleanup();
    };
  }, [availabilityService]);

  return {
    checkAvailability,
    reserveSlot,
    cancelReservation,
    isChecking,
    lastCheck,
    activeReservations: availabilityService.getActiveReservations(),
    isReservedByClient: availabilityService.isReservedByClient.bind(
      availabilityService
    ),
  };
}

function BookingComponent({
  courtId,
  selectedDate,
  selectedTimeSlot,
  customerId,
}) {
  const {
    checkAvailability,
    reserveSlot,
    cancelReservation,
    isChecking,
    isReservedByClient,
  } = useAvailabilityCheck();

  const [availability, setAvailability] = useState(null);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    if (courtId && selectedDate && selectedTimeSlot) {
      checkAvailability(
        courtId,
        selectedDate,
        selectedTimeSlot.startTime,
        selectedTimeSlot.endTime,
        customerId
      ).then(setAvailability);
    }
  }, [courtId, selectedDate, selectedTimeSlot, customerId, checkAvailability]);

  const handleReserveSlot = async () => {
    if (
      !isReservedByClient(
        courtId,
        selectedDate,
        selectedTimeSlot.startTime,
        selectedTimeSlot.endTime
      )
    ) {
      const result = await reserveSlot(
        courtId,
        selectedDate,
        selectedTimeSlot.startTime,
        selectedTimeSlot.endTime,
        customerId
      );

      if (result.success) {
        setReservation(result);
        // Show countdown timer for reservation expiration
      }
    }
  };

  const handleCancelReservation = async () => {
    if (reservation) {
      await cancelReservation(reservation.reservationId);
      setReservation(null);
    }
  };

  return (
    <div>
      {isChecking && <div>Checking availability...</div>}

      {availability && (
        <div>
          <div>Available: {availability.available ? "Yes" : "No"}</div>
          {availability.reserved && (
            <div>Currently reserved by another user</div>
          )}
        </div>
      )}

      {reservation && (
        <div>
          <div>
            Slot reserved until:{" "}
            {new Date(reservation.expiresAt).toLocaleTimeString()}
          </div>
          <button onClick={handleCancelReservation}>Cancel Reservation</button>
        </div>
      )}

      {availability?.available && !reservation && (
        <button onClick={handleReserveSlot} disabled={isChecking}>
          Reserve Slot
        </button>
      )}
    </div>
  );
}

export { AvailabilityService, useAvailabilityCheck, BookingComponent };
