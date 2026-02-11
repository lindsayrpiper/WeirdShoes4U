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

// Global error handler for resource loading failures (images, scripts, stylesheets)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Check if it's a resource loading error
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      const resourceType = target.tagName.toLowerCase();
      const resourceUrl = (target as HTMLImageElement | HTMLScriptElement | HTMLLinkElement).src || (target as HTMLLinkElement).href;

      Sentry.captureException(new Error(`Failed to load ${resourceType}: ${resourceUrl}`), {
        level: 'warning',
        tags: {
          resource_type: resourceType,
          error_type: 'resource_loading_error',
        },
        contexts: {
          resource: {
            url: resourceUrl,
            type: resourceType,
            page: window.location.pathname,
          },
        },
      });

      Sentry.addBreadcrumb({
        category: 'resource.error',
        message: `Failed to load ${resourceType}`,
        level: 'error',
        data: {
          url: resourceUrl,
          type: resourceType,
        },
      });
    }
  }, true); // Use capture phase to catch errors before they bubble
}
