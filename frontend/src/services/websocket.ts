interface EventSocketConnection {
  close: () => void;
}

export function connectEventSocket(onMessage: (data: unknown) => void): EventSocketConnection | null {
  const token = sessionStorage.getItem('access_token');
  if (!token) return null;

  let socket: WebSocket | null = null;
  let reconnectTimer: number | undefined;
  let closed = false;

  const connect = () => {
    if (closed) return;

    socket = new WebSocket('ws://127.0.0.1:8000/ws/events?token=' + encodeURIComponent(token));

    socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        console.error('Invalid WebSocket message');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    socket.onclose = () => {
      if (!closed) {
        reconnectTimer = window.setTimeout(connect, 2000);
      }
    };
  };

  connect();

  return {
    close: () => {
      closed = true;
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    },
  };
}
