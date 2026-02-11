# Sentry Performance Instrumentation

This document details the comprehensive Sentry performance monitoring setup added to the WeirdShoes4U application.

## Overview

The application now includes extensive Sentry performance instrumentation to track:
- API route performance
- Service layer operations
- Client-side component rendering
- User interactions
- Database/service queries
- External API calls

## Configuration

### Client-Side (`sentry.client.config.ts`)

Enhanced with:
- **Browser Tracing Integration**: Automatic navigation and interaction tracking
- **Browser Profiling**: Detailed CPU profiling for client-side code
- **Session Replay**: Visual debugging with configurable sampling
- **INP Tracking**: Interaction to Next Paint metrics
- **Long Task Monitoring**: Detection of blocking JavaScript
- **Custom Route Tracking**: Automatic page navigation instrumentation

Key Settings:
```typescript
tracesSampleRate: 1.0          // 100% transaction sampling
profilesSampleRate: 1.0        // 100% profiling
replaysSessionSampleRate: 0.1  // 10% session replay
replaysOnErrorSampleRate: 1.0  // 100% replay on errors
```

### Server-Side (`sentry.server.config.ts`)

Enhanced with:
- **Node Profiling Integration**: CPU and memory profiling
- **HTTP Integration**: Automatic HTTP request tracking
- **Custom Trace Sampler**: Granular sampling control per route
- **Enhanced Error Context**: Automatic breadcrumbs for API calls

Key Settings:
```typescript
tracesSampleRate: 1.0    // 100% transaction sampling
profilesSampleRate: 1.0  // 100% profiling
enableLogs: true         // Sentry logs enabled
sendDefaultPii: true     // User context included
```

## Performance Utilities

### Client-Side (`src/frontend/utils/sentryPerformance.ts`)

#### Functions:

1. **`startTransaction(name, op)`**
   - Start a custom performance transaction
   - Useful for tracking specific operations

2. **`measureAsync(spanName, fn, op)`**
   - Measure async function execution time
   - Automatically captures exceptions
   - Adds custom measurements

3. **`measureSync(spanName, fn, op)`**
   - Measure synchronous function execution
   - Tracks duration and errors

4. **`trackApiCall(endpoint, apiCall)`**
   - Track API call performance
   - Captures HTTP status codes
   - Adds breadcrumbs for debugging
   - Measures duration

5. **`trackComponentRender(componentName)`**
   - Track React component render performance
   - Logs slow renders (>100ms)

6. **`trackInteraction(action, category, data)`**
   - Track user interactions (clicks, form submissions, etc.)
   - Adds breadcrumbs with context

7. **`trackPageLoad(pageName)`**
   - Track page load performance metrics
   - Captures navigation timing
   - Measures DOM content loaded time

8. **`addPerformanceMark(name)`** & **`measureBetweenMarks(...)`**
   - Custom performance marking
   - Measure between specific points

### Server-Side (`src/backend/utils/sentryPerformance.ts`)

#### Functions:

1. **`trackApiRoute(routeName, handler)`**
   - Wrap API routes with performance tracking
   - Captures route-specific metrics
   - Logs slow routes (>1000ms)

2. **`trackServiceOperation(serviceName, operationName, operation)`**
   - Track service layer operations
   - Measures business logic performance

3. **`trackDatabaseQuery(queryName, query, queryDetails)`**
   - Track database query performance
   - Logs slow queries (>500ms)
   - Structured for real database integration

4. **`trackExternalApiCall(apiName, endpoint, apiCall)`**
   - Track external API call performance
   - Captures HTTP details

5. **`trackAuthOperation(operation, fn)`**
   - Specialized auth operation tracking
   - Security-focused error handling

6. **`withPerformanceTracking(name, fn)`**
   - Middleware wrapper for automatic tracking

7. **`setRequestContext(context)`**
   - Add request context for better error tracking

## Instrumented Code

### API Routes

**`src/app/api/products/route.ts`**
- Wrapped entire GET handler with `trackApiRoute`
- Tracks service operations (search, category filter, etc.)
- Monitors artificial delays
- Captures severe performance issues
- Measures product count returned

### Services

**`src/backend/services/cartService.ts`**
- `addItemToCart`: Performance spans added
- Tracks cart operation duration
- Captures stock validation errors
- Monitors the intentional double calculation bug

### Frontend Components

**`src/frontend/components/ProductCard.tsx`**
- Component render tracking
- Product load performance measurement
- Add to cart interaction tracking
- Price change monitoring
- Error capture with product context

**`src/frontend/context/CartContext.tsx`**
- API call performance tracking for cart operations
- Breadcrumbs for cart state changes
- Error capture with detailed context
- Cart items count measurements

## Custom Measurements

The application tracks these custom measurements:

### Client-Side:
- `load_product_{id}` - Time to load each product
- `add_to_cart_operation` - Add to cart duration
- `render_{ComponentName}` - Component render time
- `api_call_{endpoint}` - API call duration
- `page_load_time` - Full page load time
- `dom_content_loaded` - DOM ready time

### Server-Side:
- `api_route_{routeName}` - API route execution time
- `service_{serviceName}_{operationName}` - Service operation duration
- `db_query_{queryName}` - Database query time
- `external_api_{apiName}` - External API call duration
- `products_returned` - Number of products in response
- `cart_add_item_duration` - Cart operation time
- `cart_items_count` - Number of items in cart

## Breadcrumbs

The application automatically adds breadcrumbs for:

### Client-Side:
- UI interactions (clicks, form submissions)
- API calls (success and failure)
- Component renders (especially slow ones)
- Price changes on product cards
- Navigation events
- Performance marks

### Server-Side:
- API route requests
- Service operations
- Database queries (slow queries logged)
- Authentication operations
- External API calls

## Error Context

All captured errors include:

### Tags:
- Operation type
- Service/component name
- Product IDs (where applicable)
- Route names
- User actions

### Contexts:
- Product details
- Cart state
- Request information
- Service operation details
- Database query details

## Performance Insights

### Tracked Issues:

1. **Slow Product Loading**
   - Products with IDs divisible by 7 or 13 load slowly
   - Tracked via `load_product_{id}` measurements

2. **API Delays**
   - Random delays (200-800ms) on all API calls
   - 5% chance of 3-second severe delay
   - Tracked via `api_route_*` measurements

3. **Cart Calculation Bug**
   - Double calculation intentionally tracked
   - Visible in performance spans

4. **Off-by-One Errors**
   - Stock validation errors captured with context
   - Cart count calculation tracked

5. **Price Fluctuations**
   - Price changes logged as breadcrumbs
   - Visible in session replays

6. **Race Conditions**
   - State update delays tracked
   - Timing issues visible in traces

## Viewing Data in Sentry

### Performance Tab:
- View transaction traces
- See span waterfall charts
- Analyze slow operations
- Identify bottlenecks

### Issues Tab:
- Stock validation errors
- Cart operation failures
- API call failures
- Component rendering errors

### Replays Tab:
- Visual playback of user sessions
- See errors in context
- Watch user interactions

### Profiling Tab:
- CPU flame graphs
- Memory usage
- Function call times
- Bottleneck identification

## Best Practices Applied

1. ✅ **100% Sampling in Development** - Capture all transactions
2. ✅ **Custom Measurements** - Track business-specific metrics
3. ✅ **Breadcrumbs** - Detailed execution trail
4. ✅ **Error Context** - Rich debugging information
5. ✅ **User Context** - Track user actions
6. ✅ **Component Tracking** - React performance monitoring
7. ✅ **API Tracking** - Full request/response cycle
8. ✅ **Service Layer** - Business logic performance

## Future Enhancements

Potential additions:
- Real database query tracking
- Cache hit/miss ratios
- Third-party API latency
- Image load performance
- Bundle size tracking
- Custom alerting rules

## Testing Performance Monitoring

To test the instrumentation:

1. **Load the Home Page**
   - Check page load metrics
   - View featured products loading

2. **Browse Products**
   - Notice varying load times
   - Track component renders

3. **Add to Cart**
   - Observe API call tracking
   - Check cart operation metrics

4. **Trigger Errors**
   - Try adding out-of-stock items
   - View error context in Sentry

5. **Check Sentry Dashboard**
   - View performance transactions
   - Analyze slow operations
   - Watch session replays
   - Review error details

## Configuration for Production

For production, adjust these settings:

```typescript
// Client
tracesSampleRate: 0.1,          // 10% sampling
profilesSampleRate: 0.01,        // 1% profiling
replaysSessionSampleRate: 0.01,  // 1% replays

// Server
tracesSampleRate: 0.2,    // 20% sampling
profilesSampleRate: 0.05,  // 5% profiling
```

## Summary

The WeirdShoes4U application now has comprehensive Sentry performance monitoring covering:
- ✅ All API routes
- ✅ Service layer operations
- ✅ Client-side component rendering
- ✅ User interactions
- ✅ Cart operations
- ✅ Error tracking with context
- ✅ Custom measurements
- ✅ Breadcrumb trails
- ✅ Session replays

This provides complete visibility into both performance and errors, making it easy to identify and fix issues in production.
