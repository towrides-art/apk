// Backend OTP Auth helper for userapp
import axios from 'axios';

// Production API URL
const API_BASE = 'https://towrides.in/api';

let currentPhone: string | null = null;

export async function sendOTP(phoneNumber: string): Promise<string> {
  try {
    const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const response = await axios.post(`${API_BASE}/user/send-otp`, {
      phone: fullNumber
    });
    
    if (response.data.success && response.data.otpLink) {
      currentPhone = fullNumber; // Store phone number for verification
      console.log('[OTPAuth] OTP Link:', response.data.otpLink);
      return response.data.otpLink;
    }
    
    throw new Error('Failed to generate OTP');
  } catch (err: any) {
    console.error('[OTPAuth] sendOTP failed:', err.message);
    throw new Error(err.message || 'Failed to send OTP');
  }
}

export async function confirmOTP(phoneNumber: string, otp: string): Promise<any> {
  try {
    const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const response = await axios.post(`${API_BASE}/user/verify-otp`, {
      phone: fullNumber,
      otp
    });
    
    if (response.data.success) {
      currentPhone = null;
      return response.data;
    }
    
    throw new Error('Invalid OTP');
  } catch (err: any) {
    console.error('[OTPAuth] confirmOTP failed:', err.message);
    throw new Error(err.message || 'Invalid OTP');
  }
}

export function resetConfirmation() {
  currentPhone = null;
}
