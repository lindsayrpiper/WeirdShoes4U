import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for development

  // Session Replay
  replaysSessionSampleRate: 1.0, // Capture 100% of sessions with replay
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    // Session Replay for visual debugging with network capture
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      networkDetailAllowUrls: ['/api/cart', '/api/orders', '/api/products', '/api/auth'],
      networkCaptureBodies: true,
    }),

    // Canvas replay for capturing canvas elements
    Sentry.replayCanvasIntegration(),

    // Browser Tracing for automatic performance monitoring
    Sentry.browserTracingIntegration({
      // Track navigation and interactions
      tracePropagationTargets: ['localhost', /^\//],

      // Enable automatic instrumentation
      enableInp: true, // Interaction to Next Paint
      enableLongTask: true, // Long task monitoring
    }),

    // Browser Profiling for detailed performance insights
    Sentry.browserProfilingIntegration(),
  ],

  // Enhanced error tracking
  beforeSend(event, hint) {
    // Add custom context
    if (event.request) {
      event.tags = {
        ...event.tags,
        url_path: event.request.url,
      };
    }
    return event;
  },

  // Performance monitoring configuration
  profilesSampleRate: 1.0, // Profile 100% of transactions

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Track releases
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});
