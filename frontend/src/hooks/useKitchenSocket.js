import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * STOMP-over-SockJS WebSocket hook for Kitchen Display.
 *
 * NOTE: Backend WebSocket config registers endpoint `/ws` on port 8081.
 *       If the connection fails (wrong port/path), the store's mock data
 *       remains visible and functional.
 */
const useKitchenSocket = (onTicketUpdate, enabled = true, onReconnect) => {
  const clientRef        = useRef(null);
  const onTicketUpdateRef = useRef(onTicketUpdate);
  const onReconnectRef   = useRef(onReconnect);

  useEffect(() => { onTicketUpdateRef.current = onTicketUpdate; }, [onTicketUpdate]);
  useEffect(() => { onReconnectRef.current   = onReconnect;     }, [onReconnect]);

  const connect = useCallback(() => {
    // Try the backend WebSocket endpoint. Falls back gracefully if unavailable.
    const WS_URL = 'http://localhost:8081/ws';
    console.log('[WS-RTROM] Connecting to', WS_URL);

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[WS-RTROM] ✅ Connected');

        const handle = (topic, msg) => {
          try {
            let data;
            try {
              data = JSON.parse(msg.body);
            } catch (e) {
              data = msg.body; // Handle plain string signals
            }
            console.log('[WS-RTROM] Message on', topic, data);
            onTicketUpdateRef.current?.(data);
          } catch (e) {
            console.error('[WS-RTROM] Dispatch error on', topic, e);
          }
        };

        // Subscribe to all kitchen-related topics
        ['/topic/kitchen', '/topic/orders', '/topic/kitchen/tickets', '/topic/updates'].forEach((topic) => {
          client.subscribe(topic, (msg) => handle(topic, msg));
          console.log('[WS-RTROM] Subscribed to', topic);
        });

        // Refetch on every connect to sync any missed events
        if (onReconnectRef.current) {
          console.log('[WS-RTROM] Triggering reconnect refetch');
          onReconnectRef.current();
        }
      },

      onDisconnect: () => console.log('[WS-RTROM] Disconnected — retrying in 5s…'),
      onStompError: (frame) => console.error('[WS-RTROM] STOMP error', frame),
    });

    client.activate();
    clientRef.current = client;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
      console.log('[WS-RTROM] Deactivated');
    };
  }, [connect, enabled]);
};

export default useKitchenSocket;
