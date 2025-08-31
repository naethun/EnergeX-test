import { io, Socket } from 'socket.io-client';

type EventCallback = (...args: unknown[]) => void;

class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();

  connect() {
    if (this.socket) return this.socket;

    this.socket = io('http://localhost:3001');
    
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.restoreListeners();
    
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: EventCallback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      if (callback) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      } else {
        eventListeners.length = 0;
      }
    }

    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  private restoreListeners() {
    if (!this.socket) return;

    for (const [event, callbacks] of this.listeners.entries()) {
      for (const callback of callbacks) {
        this.socket.on(event, callback);
      }
    }
  }
}

export const socketManager = new SocketManager();