import { NextResponse } from 'next/server';
import { productService } from '@/backend/services/productService';

export async function GET() {
  try {
    const categories = productService.getCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
