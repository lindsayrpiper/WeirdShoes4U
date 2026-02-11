import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/backend/services/orderService';
import { ShippingAddress } from '@/types';
import * as Sentry from '@sentry/nextjs';

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
  return Sentry.startSpan(
    { name: 'api.orders.create', op: 'http.server' },
    async () => {
      try {
        const body = await request.json();
        const { userId, cartId, shippingAddress } = body;

        if (!userId || !cartId || !shippingAddress) {
          Sentry.logger.warn('Order POST: missing required fields', { userId, cartId, hasAddress: !!shippingAddress });
          return NextResponse.json(
            {
              success: false,
              error: 'User ID, Cart ID, and shipping address are required',
            },
            { status: 400 }
          );
        }

        Sentry.logger.info('Creating order', { userId, cartId, shippingCity: shippingAddress.city, shippingState: shippingAddress.state });

        const order = orderService.createOrder(
          userId,
          cartId,
          shippingAddress as ShippingAddress
        );

        if (!order) {
          Sentry.logger.error('Order creation returned null', { userId, cartId });
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to create order',
            },
            { status: 400 }
          );
        }

        Sentry.logger.info('Order created successfully', {
          orderId: order.id,
          userId,
          total: order.total,
          itemCount: order.items.length,
          status: order.status,
        });

        return NextResponse.json({
          success: true,
          data: order,
        });
      } catch (error: any) {
        Sentry.captureException(error);
        Sentry.logger.error('Order creation failed', { error: error.message });
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Failed to create order',
          },
          { status: 500 }
        );
      }
    }
  );
}
