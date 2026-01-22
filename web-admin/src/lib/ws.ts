import type { OrderTrackingEvent } from "@/lib/types";

const WS_BASE_URL = (import.meta.env.VITE_WS_URL ?? "ws://localhost:8000").replace(/\/$/, "");

type MessageHandler<T> = (payload: T) => void;

export const connectNotifications = (token: string, onMessage: MessageHandler<unknown>) => {
  const socket = new WebSocket(`${WS_BASE_URL}/ws/notifications/?token=${token}`);
  socket.onmessage = (event) => onMessage(JSON.parse(event.data));
  return socket;
};

export const connectOrderTracking = (
  token: string,
  orderId: number,
  onMessage: MessageHandler<OrderTrackingEvent>
) => {
  const socket = new WebSocket(`${WS_BASE_URL}/ws/orders/${orderId}/tracking/?token=${token}`);
  socket.onmessage = (event) => onMessage(JSON.parse(event.data) as OrderTrackingEvent);
  return socket;
};

export const connectOrderChat = (
  token: string,
  orderId: number,
  onMessage: MessageHandler<unknown>
) => {
  const socket = new WebSocket(`${WS_BASE_URL}/ws/orders/${orderId}/chat/?token=${token}`);
  socket.onmessage = (event) => onMessage(JSON.parse(event.data));
  return socket;
};
