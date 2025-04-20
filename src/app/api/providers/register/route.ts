import { NextResponse } from 'next/server';
import api from '@/utils/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await api.post('/providers/register', body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Provider registration error:', error);
    
    // Handle specific error cases
    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Backend service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    if (error.message.includes('Network error')) {
      return NextResponse.json(
        { error: 'Unable to connect to the backend service. Please check your connection.' },
        { status: 503 }
      );
    }

    // Handle backend response errors
    if (error.response?.data) {
      return NextResponse.json(
        { error: error.response.data.message || 'Registration failed' },
        { status: error.response.status || 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
} 