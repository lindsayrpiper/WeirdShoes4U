import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/backend/services/cartService';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'api.cart.get', op: 'http.server' }, () => {
    try {
      const { searchParams } = new URL(request.url);
      const cartId = searchParams.get('cartId');

      if (!cartId) {
        Sentry.logger.warn('Cart GET: missing cartId');
        return NextResponse.json(
          {
            success: false,
            error: 'Cart ID is required',
          },
          { status: 400 }
        );
      }

      let cart = cartService.getCart(cartId);
      if (!cart) {
        Sentry.logger.info('Cart not found, creating new cart', { requestedCartId: cartId });
        cart = cartService.createCart(undefined, cartId);
      }

      Sentry.logger.info('Cart fetched', { cartId: cart.id, itemCount: cart.items.length, total: cart.total });

      return NextResponse.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch cart',
        },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'api.cart.add_item', op: 'http.server' }, async () => {
    try {
      const body = await request.json();
      const { cartId, productId, quantity = 1 } = body;

      if (!productId) {
        Sentry.logger.warn('Cart POST: missing productId');
        return NextResponse.json(
          {
            success: false,
            error: 'Product ID is required',
          },
          { status: 400 }
        );
      }

      Sentry.logger.info('Adding item to cart', { cartId, productId, quantity });

      let cart;
      if (cartId) {
        cart = cartService.addItemToCart(cartId, productId, quantity);
      } else {
        const newCart = cartService.createCart();
        cart = cartService.addItemToCart(newCart.id, productId, quantity);
      }

      if (!cart) {
        Sentry.logger.error('Failed to add item to cart', { cartId, productId });
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to add item to cart',
          },
          { status: 400 }
        );
      }

      Sentry.logger.info('Item added to cart', { cartId: cart.id, productId, itemCount: cart.items.length, total: cart.total });

      return NextResponse.json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      Sentry.captureException(error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to add item to cart',
        },
        { status: 500 }
      );
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'api.cart.update_quantity', op: 'http.server' }, async () => {
    try {
      const body = await request.json();
      const { cartId, productId, quantity } = body;

      if (!cartId || !productId || quantity === undefined) {
        Sentry.logger.warn('Cart PUT: missing required fields', { cartId, productId, quantity });
        return NextResponse.json(
          {
            success: false,
            error: 'Cart ID, Product ID, and quantity are required',
          },
          { status: 400 }
        );
      }

      Sentry.logger.info('Updating cart item quantity', { cartId, productId, quantity });

      const cart = cartService.updateItemQuantity(cartId, productId, quantity);

      if (!cart) {
        Sentry.logger.error('Failed to update cart item', { cartId, productId });
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update cart item',
          },
          { status: 400 }
        );
      }

      Sentry.logger.info('Cart item updated', { cartId, productId, newQuantity: quantity, total: cart.total });

      return NextResponse.json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      Sentry.captureException(error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to update cart item',
        },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan({ name: 'api.cart.remove_item', op: 'http.server' }, () => {
    try {
      const { searchParams } = new URL(request.url);
      const cartId = searchParams.get('cartId');
      const productId = searchParams.get('productId');

      if (!cartId || !productId) {
        Sentry.logger.warn('Cart DELETE: missing required fields', { cartId, productId });
        return NextResponse.json(
          {
            success: false,
            error: 'Cart ID and Product ID are required',
          },
          { status: 400 }
        );
      }

      Sentry.logger.info('Removing item from cart', { cartId, productId });

      const cart = cartService.removeItem(cartId, productId);

      if (!cart) {
        Sentry.logger.error('Failed to remove item from cart', { cartId, productId });
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to remove item from cart',
          },
          { status: 400 }
        );
      }

      Sentry.logger.info('Item removed from cart', { cartId, productId, remainingItems: cart.items.length, total: cart.total });

      return NextResponse.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to remove item from cart',
        },
        { status: 500 }
      );
    }
  });
}
