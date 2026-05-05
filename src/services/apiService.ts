const API_BASE = 'http://10.0.2.2:4000/api'; // Android emulator; use real IP for device

async function getToken(): Promise<string | null> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return AsyncStorage.getItem('token');
}

async function apiFetch(path: string, opts: any = {}) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json();
}

export const userApi = {
  login: (phone: string, password: string) => apiFetch('/user/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),
  register: (data: any) => apiFetch('/user/register', { method: 'POST', body: JSON.stringify(data) }),
  createRide: (data: any) => apiFetch('/user/rides/book', { method: 'POST', body: JSON.stringify(data) }),
  rideHistory: () => apiFetch('/user/rides/rideHistory'),
  rideDetail: (id: string) => apiFetch(`/user/rides/rideStatus`, { method: 'POST', body: JSON.stringify({ booking_id: id }) }),
};
