import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,

  // Capture 100% of sessions with replay
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      networkDetailAllowUrls: ['/api/cart', '/api/orders', '/api/products', '/api/auth'],
      networkCaptureBodies: true,
    }),
    Sentry.replayCanvasIntegration(),
  ],
});
