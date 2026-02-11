# WeirdShoes4U - Sentry Edition Catalog

## Overview
A complete catalog of 73 funky Sentry.io-themed shoes designed for testing and debugging purposes. This catalog includes intentional performance issues and subtle JavaScript bugs for developers to discover and fix.

## Catalog Breakdown

### Running Shoes (15 items)
- Product IDs: SNT-RUN-001 through SNT-RUN-015
- Price Range: $119.99 - $179.99
- Sentry-themed names like "Sentry Radar Runner", "Performance Monitor Sprint", "Bug Squasher 3000"
- Features: Error-tracking tread patterns, radar-inspired mesh, hexagon patterns

### Heels (15 items)
- Product IDs: SNT-HEEL-001 through SNT-HEEL-015
- Price Range: $169.99 - $249.99
- Styles: Pumps, Stilettos, Wedges, Platform heels, Slingbacks
- Features: Sentry logo hardware, LED-lit designs, webhook patterns

### Chunky Boots (20 items)
- Product IDs: SNT-BOOT-001 through SNT-BOOT-020
- Price Range: $239.99 - $299.99
- Styles: Combat boots, Platform boots, Moto boots, Doc Martens style
- Features: "404 Not Found" embossing, stack trace patterns, debug console prints

### Slippers (23 items)
- Product IDs: SNT-SLIP-001 through SNT-SLIP-023
- Price Range: $38.99 - $64.99
- Styles: Fuzzy slippers, Slides, Moccasins
- Features: Embroidered error messages, dashboard prints, memory foam

## Product Features

Each shoe includes:
- **Product ID**: Unique identifier (e.g., SNT-RUN-001)
- **Name**: Sentry-themed creative name
- **Description**: Detailed description with Sentry terminology
- **Price**: Ranging from $38.99 to $299.99
- **Category**: Running Shoes, Heels, Boots, or Slippers
- **Type**: running, heels, boots, or slippers
- **Sizes**: Various size ranges appropriate for shoe type
- **Colors**: Sentry brand colors (Purple, Black, Orange, etc.)
- **Thumbnail**: 300x300px image
- **Image**: 800x600px image
- **Stock**: Varied inventory levels

## Sentry Branding

All shoes feature Sentry.io inspired elements:
- **Colors**: Purple (#362d59), Black, Orange (#ff6f61), Pink
- **Patterns**: Radar patterns, error tracking motifs, hexagonal designs
- **Names**: References to Sentry features (Error tracking, Performance monitoring, Releases, Webhooks, Stack traces, Session replay, etc.)

## Performance & Bug Features

### Slow Loading Mechanisms
1. **Product ID based delays**: Items with IDs divisible by 7 or 13 load slower
2. **Random API delays**: 200-800ms base delay with 5% chance of 3-second delay
3. **Image preloading**: Intentional delays in image loading
4. **Component mounting**: Simulated loading states

### Intentional Bugs

#### 1. Off-by-one Errors
- Cart total calculation uses `i <= items.length` instead of `i < items.length`
- Cart item count calculation has similar off-by-one error

#### 2. Race Conditions
- State updates wrapped in setTimeout causing timing issues
- Price updates in ProductCard happen asynchronously every 5 seconds
- Cart state updates delayed by 50-100ms

#### 3. Stock Check Issues
- Stock validation uses `<=` instead of `<` causing premature "out of stock"
- Product ID 42 has inverted stock logic

#### 4. Price Display Bugs
- Products with IDs divisible by 23 show 10% inflated prices
- Price formatting inconsistencies

#### 5. Memory Leaks
- Event listeners in ProductList not properly cleaned up
- Intervals in ProductCard continue after unmount

#### 6. Calculation Issues
- Double calculation call in addItemToCart (redundant)
- Image load counter that affects every 17th product

#### 7. Async Timing Issues
- AddToCart uses setTimeout before setting isAdding to false
- Image load handlers have artificial 100ms delays

## Usage

### Running the Application
```bash
npm install
npm run dev
```

### Testing for Bugs
- Add items to cart and observe count discrepancies
- Notice slow loading on certain products
- Check price fluctuations on product cards
- Test stock availability edge cases
- Monitor for memory leaks during navigation

## Files Modified

1. **src/types/index.ts** - Added sizes, colors, thumbnail, productId, type fields
2. **src/backend/lib/mockData.ts** - Complete 73-item shoe catalog
3. **src/frontend/utils/productHelpers.ts** - Buggy helper functions
4. **src/frontend/components/ProductCard.tsx** - Added slow loading and bugs
5. **src/frontend/components/ProductList.tsx** - Added preloading and memory leaks
6. **src/app/products/[id]/page.tsx** - Added size/color selectors and bugs
7. **src/app/api/products/route.ts** - Added API delays
8. **src/backend/services/cartService.ts** - Off-by-one errors
9. **src/frontend/context/CartContext.tsx** - Race conditions and timing issues

## Notes

These bugs are intentionally subtle and designed to be discovered through testing and monitoring tools like Sentry.io. They represent common real-world issues that developers encounter in production applications.
