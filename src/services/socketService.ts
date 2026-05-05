import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = 'http://10.0.2.2:4000'; // Android emulator; use IP for real device

let socket: Socket | null = null;

export async function connectUserSocket(): Promise<Socket> {
  const token = await AsyncStorage.getItem('user_token');
  if (!token) throw new Error('No user token');

  socket = io(BACKEND_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => console.log('[Socket] User connected'));
  socket.on('disconnect', () => console.log('[Socket] User disconnected'));
  socket.on('connect_error', (err) => console.log('[Socket] Error:', err.message));

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

// ── EMIT EVENTS ──────────────────────────────────────────

export function cancelRide(rideId: string, reason?: string) {
  socket?.emit('cancelRide', { rideId, reason: reason || 'Cancelled by user' });
}

// ── LISTEN EVENTS ────────────────────────────────────────

export function onRideAccepted(callback: (data: any) => void) {
  socket?.on('rideAccepted', callback);
  return () => socket?.off('rideAccepted', callback);
}

export function onDriverArrived(callback: (data: any) => void) {
  socket?.on('driverArrived', callback);
  return () => socket?.off('driverArrived', callback);
}

export function onRideStarted(callback: (data: any) => void) {
  socket?.on('rideStarted', callback);
  return () => socket?.off('rideStarted', callback);
}

export function onRideCompleted(callback: (data: any) => void) {
  socket?.on('rideCompleted', callback);
  return () => socket?.off('rideCompleted', callback);
}

export function onRideCancelled(callback: (data: any) => void) {
  socket?.on('rideCancelled', callback);
  return () => socket?.off('rideCancelled', callback);
}

export function onLocationUpdate(callback: (data: any) => void) {
  socket?.on('locationUpdate', callback);
  return () => socket?.off('locationUpdate', callback);
}

export function onNotification(callback: (data: any) => void) {
  socket?.on('notification', callback);
  return () => socket?.off('notification', callback);
}

export function onError(callback: (data: any) => void) {
  socket?.on('error', callback);
  return () => socket?.off('error', callback);
}
