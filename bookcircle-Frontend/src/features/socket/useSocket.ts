import { useEffect } from "react";
import { socketService } from "../../services";
import type {
  SocketEventType,
  SocketEventPayload,
} from "../../services/interfaces/ISocketService";
import { useAuth } from "../../app/providers/AuthContext";

/**
 * Connects the socket when authenticated, disconnects on logout.
 * Call this once at the app root level (e.g. in AppProviders or DashboardLayout).
 */
export const useSocketConnection = () => {
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);
};

/**
 * Subscribe to a specific socket event. Handler is stable across renders.
 * Automatically unsubscribes on unmount.
 */
export const useSocketEvent = <E extends SocketEventType>(
  event: E,
  handler: (payload: SocketEventPayload[E]) => void,
): void => {
  useEffect(() => {
    socketService.on(event, handler);
    return () => {
      socketService.off(event, handler);
    };
    // handler must be stable — wrap in useCallback at the call site
  }, [event, handler]);
};
