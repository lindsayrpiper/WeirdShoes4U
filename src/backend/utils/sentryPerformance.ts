import * as Sentry from '@sentry/nextjs';

/**
 * Track API route performance
 */
export async function trackApiRoute<T>(
  routeName: string,
  handler: () => Promise<T>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: `API Route: ${routeName}`,
      op: 'http.server',
      attributes: {
        'http.route': routeName,
      },
    },
    async (span) => {
      const startTime = Date.now();

      try {
        const result = await handler();
        const duration = Date.now() - startTime;

        span?.setStatus({ code: 1, message: 'ok' });
        span?.setAttribute('http.status_code', 200);

        Sentry.setMeasurement(`api_route_${routeName}`, duration, 'millisecond');

        if (duration > 1000) {
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `Slow API route: ${routeName}`,
            level: 'warning',
            data: { duration },
          });
        }

        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });
        span?.setAttribute('http.status_code', 500);

        Sentry.captureException(error, {
          tags: {
            api_route: routeName,
          },
        });

        throw error;
      }
    }
  );
}

/**
 * Track service layer operations
 */
export async function trackServiceOperation<T>(
  serviceName: string,
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: `${serviceName}.${operationName}`,
      op: 'function',
      attributes: {
        service: serviceName,
        operation: operationName,
      },
    },
    async (span) => {
      const startTime = Date.now();

      try {
        const result = await operation();
        const duration = Date.now() - startTime;

        span?.setStatus({ code: 1, message: 'ok' });

        Sentry.setMeasurement(
          `service_${serviceName}_${operationName}`,
          duration,
          'millisecond'
        );

        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });

        Sentry.captureException(error, {
          tags: {
            service: serviceName,
            operation: operationName,
          },
          contexts: {
            service: {
              name: serviceName,
              operation: operationName,
            },
          },
        });

        throw error;
      }
    }
  );
}

/**
 * Track database queries (mock for now, but structured for real DB)
 */
export async function trackDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>,
  queryDetails?: Record<string, any>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: `DB Query: ${queryName}`,
      op: 'db.query',
      attributes: {
        'db.operation': queryName,
        ...queryDetails,
      },
    },
    async (span) => {
      const startTime = Date.now();

      try {
        const result = await query();
        const duration = Date.now() - startTime;

        span?.setStatus({ code: 1, message: 'ok' });

        Sentry.setMeasurement(`db_query_${queryName}`, duration, 'millisecond');

        if (duration > 500) {
          Sentry.addBreadcrumb({
            category: 'database',
            message: `Slow database query: ${queryName}`,
            level: 'warning',
            data: {
              duration,
              ...queryDetails,
            },
          });
        }

        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });

        Sentry.captureException(error, {
          tags: {
            query_name: queryName,
          },
          contexts: {
            database: {
              query: queryName,
              ...queryDetails,
            },
          },
        });

        throw error;
      }
    }
  );
}

/**
 * Track external API calls
 */
export async function trackExternalApiCall<T>(
  apiName: string,
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: `External API: ${apiName}`,
      op: 'http.client',
      attributes: {
        'http.url': endpoint,
        'http.method': 'GET',
      },
    },
    async (span) => {
      const startTime = Date.now();

      try {
        const result = await apiCall();
        const duration = Date.now() - startTime;

        span?.setStatus({ code: 1, message: 'ok' });
        span?.setAttribute('http.status_code', 200);

        Sentry.setMeasurement(`external_api_${apiName}`, duration, 'millisecond');

        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });
        span?.setAttribute('http.status_code', 500);

        Sentry.captureException(error, {
          tags: {
            api_name: apiName,
            endpoint,
          },
        });

        throw error;
      }
    }
  );
}

/**
 * Add custom breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture custom message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Wrap async middleware with performance tracking
 */
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    return await Sentry.startSpan(
      {
        name: `Middleware: ${name}`,
        op: 'middleware',
      },
      async () => {
        return await fn(...args);
      }
    );
  }) as T;
}

/**
 * Track authentication operations
 */
export async function trackAuthOperation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: `Auth: ${operation}`,
      op: 'auth',
      attributes: {
        'auth.operation': operation,
      },
    },
    async (span) => {
      try {
        const result = await fn();
        span?.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });

        Sentry.captureException(error, {
          tags: {
            auth_operation: operation,
          },
        });

        throw error;
      }
    }
  );
}

/**
 * Set request context for better error tracking
 */
export function setRequestContext(context: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
}) {
  Sentry.setContext('request', context);
}
