// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://233e5b2bef026f6773854c60b9e45691@o4510869012611072.ingest.us.sentry.io/4510869639200768",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Capture 100% of sessions with replay
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

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

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
