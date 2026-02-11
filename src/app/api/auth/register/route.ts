import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/backend/services/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, password, and name are required',
        },
        { status: 400 }
      );
    }

    const user = await authService.registerUser(email, password, name);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to register user',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to register user',
      },
      { status: 500 }
    );
  }
}
