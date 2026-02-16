import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { MetricsData } from '../types';

type MessageCallback = (metrics: MetricsData) => void;
type ConnectCallback = () => void;
type ErrorCallback = (error: Error | unknown) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 3000;

  connect(
    onMessageCallback: MessageCallback,
    onConnectCallback?: ConnectCallback,
    onErrorCallback?: ErrorCallback
  ): void {
    const socketUrl = 'http://localhost:8080/ws-monitoring';

    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl) as unknown as WebSocket,

      onConnect: (frame) => {
        console.log('WebSocket Connected:', frame);
        this.connected = true;
        this.reconnectAttempts = 0;

        // Subscribe to metrics topic
        this.client?.subscribe('/topic/metrics', (message: IMessage) => {
          try {
            const metrics: MetricsData = JSON.parse(message.body);
            onMessageCallback(metrics);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

        if (onConnectCallback) onConnectCallback();
      },

      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        this.connected = false;
        if (onErrorCallback) onErrorCallback(frame);
        this.attemptReconnect(onMessageCallback, onConnectCallback, onErrorCallback);
      },

      onWebSocketClose: () => {
        console.log('WebSocket Disconnected');
        this.connected = false;
        this.attemptReconnect(onMessageCallback, onConnectCallback, onErrorCallback);
      },

      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        if (onErrorCallback) onErrorCallback(error);
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str: string) => {
        console.log('STOMP Debug:', str);
      },
    });

    this.client.activate();
  }

  private attemptReconnect(
    onMessageCallback: MessageCallback,
    onConnectCallback?: ConnectCallback,
    onErrorCallback?: ErrorCallback
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        if (!this.connected) {
          this.connect(onMessageCallback, onConnectCallback, onErrorCallback);
        }
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export default new WebSocketService();
