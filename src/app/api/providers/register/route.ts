import { NextResponse } from 'next/server';
import api from '@/utils/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await api.post('/providers/register', body);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Provider registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register provider' },
      { status: 500 }
    );
  }
} 