import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.isConnected) return;

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket:', frame);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.isConnected = false;
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.isConnected = false;
    };

    this.stompClient.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      this.isConnected = false;
    };

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.isConnected = false;
    }
  }

  subscribeToCustomerBookings(customerId, onMessage) {
    if (!this.isConnected || !this.stompClient) {
      console.log('WebSocket not connected, attempting to connect...');
      this.connect();
      // Wait for connection before subscribing
      setTimeout(() => {
        this.subscribeToCustomerBookings(customerId, onMessage);
      }, 1000);
      return;
    }

    const destination = `/user/${customerId}/queue/bookings`;
    console.log('Subscribing to:', destination);

    this.stompClient.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('Received WebSocket message:', data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  }

  handleReconnect(customerId, onMessage) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
        setTimeout(() => {
          this.subscribeToCustomerBookings(customerId, onMessage);
        }, 1000);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  sendMessage(destination, message) {
    if (this.isConnected && this.stompClient) {
      this.stompClient.publish({
        destination,
        body: JSON.stringify(message)
      });
    } else {
      console.error('WebSocket not connected');
    }
  }
}

export default new WebSocketService();
