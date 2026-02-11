import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/backend/services/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    const user = await authService.loginUser(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
      token: user.id, // In production, use JWT token
      message: 'Login successful',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to login',
      },
      { status: 500 }
    );
  }
}
