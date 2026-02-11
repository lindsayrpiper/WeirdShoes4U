// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://233e5b2bef026f6773854c60b9e45691@o4510869012611072.ingest.us.sentry.io/4510869639200768",

  // Performance Monitoring - Sample all transactions
  tracesSampleRate: 1.0,

  // Server-side Profiling for CPU and memory insights
  profilesSampleRate: 1.0,

  integrations: [
    // Node Profiling Integration
    Sentry.nodeProfilingIntegration(),

    // HTTP Integration for automatic request tracking
    Sentry.httpIntegration({
      tracing: true,
    }),
  ],

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Send user information for better debugging
  sendDefaultPii: true,

  // Enhanced error context
  beforeSend(event, hint) {
    // Add custom server-side context
    event.tags = {
      ...event.tags,
      server_side: true,
    };

    // Add breadcrumb for API calls
    if (event.request?.url) {
      Sentry.addBreadcrumb({
        category: 'api',
        message: `Server request: ${event.request.url}`,
        level: 'info',
      });
    }

    return event;
  },

  // Custom trace sampler for granular control
  tracesSampler: (samplingContext) => {
    // Always sample API routes
    if (samplingContext.request?.url?.includes('/api/')) {
      return 1.0;
    }

    // Sample all other requests
    return 1.0;
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Track releases
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
