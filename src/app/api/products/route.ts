import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/backend/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    let products;

    if (search) {
      products = productService.searchProducts(search);
    } else if (category) {
      products = productService.getProductsByCategory(category);
    } else if (featured === 'true') {
      products = productService.getFeaturedProducts();
    } else {
      products = productService.getAllProducts();
    }

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
