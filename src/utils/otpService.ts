import axios from 'axios';

const BASE_URL = 'https://towrides.in/api';

export const sendOTP = async (phone: string): Promise<string | null> => {
  const response = await axios.post(`${BASE_URL}/auth/send-otp`, { phone });
  return response.data?.otpLink || null;
};

export const confirmOTP = async (phone: string, otp: string): Promise<any> => {
  const response = await axios.post(`${BASE_URL}/auth/verify-otp`, { phone, otp });
  return response.data;
};

export const resetConfirmation = (): void => {};
