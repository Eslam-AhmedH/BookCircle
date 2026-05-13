import * as signalR from '@microsoft/signalr'
import type {
  ISocketService,
  SocketEventType,
  SocketEventPayload,
} from '../interfaces/ISocketService'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5089'

class SignalRSocketService implements ISocketService {
  private connection: signalR.HubConnection | null = null
  private handlers: Map<string, Set<(payload: any) => void>> = new Map()
  private startPromise: Promise<void> | null = null

  connect(token: string): void {
    if (this.connection) {
      console.log('SignalR already connected')
      return
    }

    this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/Hubs/NotificationHub`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build()

    // Register all backend events
    const events: SocketEventType[] = [
      'borrow_request_new',
      'borrow_request_accepted',
      'borrow_request_rejected',
      'comment_new',
      'comment_reply',
      'notification_new',
      'book_status_changed',
    ]

    events.forEach((event) => {
      this.connection!.on(event, (payload: any) => {
        const handlers = this.handlers.get(event)
        if (handlers) {
          handlers.forEach((handler) => handler(payload))
        }
        
        // Make a browser notification if supported
        if (event === 'notification_new') {
            this.showBrowserNotification(payload.message || 'New notification');
        }
      })
    })

    this.startPromise = this.connection
        .start()
        .then(() => {
            console.log('✅ SignalR Connected')
            this.startPromise = null;
        })
        .catch((err) => {
            console.error('❌ SignalR Connection Error:', err)
            this.startPromise = null;
        })
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      // If still starting, wait for it to finish before stopping
      if (this.startPromise) {
          try {
              await this.startPromise;
          } catch (e) {
              // start failed, nothing to stop
          }
      }
        
      if (this.connection.state === signalR.HubConnectionState.Connected) {
          await this.connection.stop()
      }
      this.connection = null
      this.handlers.clear()
      console.log('SignalR Disconnected')
    }
  }

  private showBrowserNotification(message: string) {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
        new Notification("BookCircle", { body: message, icon: '/vite.svg' });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("BookCircle", { body: message, icon: '/vite.svg' });
            }
        });
    }
  }

  on<E extends SocketEventType>(
      event: E,
      handler: (payload: SocketEventPayload[E]) => void
  ): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler as (payload: any) => void)
  }

  off<E extends SocketEventType>(
      event: E,
      handler: (payload: SocketEventPayload[E]) => void
  ): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.delete(handler as (payload: any) => void)
    }
  }

  emit(event: string, payload: unknown): void {
    if (this.connection) {
      this.connection.invoke(event, payload).catch((err) => {
        console.error(`Error invoking ${event}:`, err)
      })
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }
}

export const socketService: ISocketService = new SignalRSocketService()
