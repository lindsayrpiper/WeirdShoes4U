import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/backend/services/cartService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
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
      cart = cartService.createCart();
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cart',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    let cart;
    if (cartId) {
      cart = cartService.addItemToCart(cartId, productId, quantity);
    } else {
      const newCart = cartService.createCart();
      cart = cartService.addItemToCart(newCart.id, productId, quantity);
    }

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to add item to cart',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add item to cart',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, productId, quantity } = body;

    if (!cartId || !productId || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cart ID, Product ID, and quantity are required',
        },
        { status: 400 }
      );
    }

    const cart = cartService.updateItemQuantity(cartId, productId, quantity);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update cart item',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update cart item',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');
    const productId = searchParams.get('productId');

    if (!cartId || !productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cart ID and Product ID are required',
        },
        { status: 400 }
      );
    }

    const cart = cartService.removeItem(cartId, productId);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to remove item from cart',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove item from cart',
      },
      { status: 500 }
    );
  }
}
