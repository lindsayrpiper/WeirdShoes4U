import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/backend/services/orderService';
import { ShippingAddress } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const orders = orderService.getUserOrders(userId);

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cartId, shippingAddress } = body;

    if (!userId || !cartId || !shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID, Cart ID, and shipping address are required',
        },
        { status: 400 }
      );
    }

    const order = orderService.createOrder(
      userId,
      cartId,
      shippingAddress as ShippingAddress
    );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create order',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create order',
      },
      { status: 500 }
    );
  }
}
