import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MetricsData } from '../types';

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();

  connect(onConnect?: () => void, onError?: (error: IFrame | Event) => void): void {
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8080';
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${wsUrl}/ws-monitoring`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str: string) => {
        console.log('STOMP: ' + str);
      },
      onConnect: () => {
        console.log('WebSocket Connected');
        if (onConnect) onConnect();
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP error', frame);
        if (onError) onError(frame);
      },
      onWebSocketError: (error: Event) => {
        console.error('WebSocket error', error);
        if (onError) onError(error);
      },
    });

    this.client.activate();
  }

  subscribe(destination: string, callback: (data: MetricsData) => void): StompSubscription | null {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket is not connected');
      return null;
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data: MetricsData = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
    }
  }

  isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }
}

export default new WebSocketService();
