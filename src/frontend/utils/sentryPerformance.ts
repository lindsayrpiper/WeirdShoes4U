import * as Sentry from '@sentry/nextjs';

/**
 * Start a custom performance transaction
 * @param name - Transaction name
 * @param op - Operation type (e.g., 'http.client', 'db.query', 'function')
 */
export function startTransaction(name: string, op: string = 'custom') {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    (span) => span
  );
}

/**
 * Measure the execution time of a function
 * @param spanName - Name of the span
 * @param fn - Function to measure
 * @param op - Operation type
 */
export async function measureAsync<T>(
  spanName: string,
  fn: () => Promise<T>,
  op: string = 'function'
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: spanName,
      op,
    },
    async () => {
      const startTime = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - startTime;

        // Add custom measurement
        Sentry.setMeasurement(spanName, duration, 'millisecond');

        return result;
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            span_name: spanName,
            operation: op,
          },
        });
        throw error;
      }
    }
  );
}

/**
 * Measure synchronous function execution
 */
export function measureSync<T>(
  spanName: string,
  fn: () => T,
  op: string = 'function'
): T {
  return Sentry.startSpan(
    {
      name: spanName,
      op,
    },
    () => {
      const startTime = performance.now();
      try {
        const result = fn();
        const duration = performance.now() - startTime;

        Sentry.setMeasurement(spanName, duration, 'millisecond');

        return result;
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            span_name: spanName,
            operation: op,
          },
        });
        throw error;
      }
    }
  );
}

/**
 * Track API call performance
 */
export async function trackApiCall<T>(
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: `API: ${endpoint}`,
      op: 'http.client',
      attributes: {
        'http.url': endpoint,
      },
    },
    async (span) => {
      const startTime = performance.now();

      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;

        span?.setStatus({ code: 1, message: 'ok' });
        span?.setAttribute('http.status_code', 200);

        // Add custom measurements
        Sentry.setMeasurement(`api_call_${endpoint}`, duration, 'millisecond');

        // Add breadcrumb
        Sentry.addBreadcrumb({
          category: 'api',
          message: `API call to ${endpoint} completed`,
          level: 'info',
          data: {
            duration,
            status: 'success',
          },
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        span?.setStatus({ code: 2, message: 'internal_error' });
        span?.setAttribute('http.status_code', 500);

        Sentry.addBreadcrumb({
          category: 'api',
          message: `API call to ${endpoint} failed`,
          level: 'error',
          data: {
            duration,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        Sentry.captureException(error, {
          tags: {
            api_endpoint: endpoint,
            api_duration: duration,
          },
        });

        throw error;
      }
    }
  );
}

/**
 * Track component render performance
 */
export function trackComponentRender(componentName: string) {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;

    Sentry.setMeasurement(`render_${componentName}`, duration, 'millisecond');

    if (duration > 100) {
      // Log slow renders
      Sentry.addBreadcrumb({
        category: 'ui.render',
        message: `Slow render detected: ${componentName}`,
        level: 'warning',
        data: {
          duration,
          component: componentName,
        },
      });
    }
  };
}

/**
 * Track user interactions
 */
export function trackInteraction(
  action: string,
  category: string = 'user',
  data?: Record<string, any>
) {
  return Sentry.startSpan(
    {
      name: `Interaction: ${action}`,
      op: 'ui.interaction',
    },
    (span) => {
      span?.setAttribute('interaction.type', action);
      span?.setAttribute('interaction.category', category);

      Sentry.addBreadcrumb({
        category: 'ui.interaction',
        message: `User ${action}`,
        level: 'info',
        data,
      });
    }
  );
}

/**
 * Add custom performance mark
 */
export function addPerformanceMark(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name);

    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Performance mark: ${name}`,
      level: 'info',
    });
  }
}

/**
 * Measure between two performance marks
 */
export function measureBetweenMarks(
  measureName: string,
  startMark: string,
  endMark: string
) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(measureName, startMark, endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      if (measure) {
        Sentry.setMeasurement(measureName, measure.duration, 'millisecond');
      }
    } catch (error) {
      console.warn('Failed to measure performance:', error);
    }
  }
}

/**
 * Track database/service operation
 */
export async function trackServiceCall<T>(
  serviceName: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return await Sentry.startSpan(
    {
      name: `${serviceName}.${operation}`,
      op: 'db.query',
      attributes: {
        'db.system': serviceName,
        'db.operation': operation,
      },
    },
    async (span) => {
      const startTime = performance.now();

      try {
        const result = await fn();
        const duration = performance.now() - startTime;

        span?.setStatus({ code: 1, message: 'ok' });

        Sentry.setMeasurement(
          `service_${serviceName}_${operation}`,
          duration,
          'millisecond'
        );

        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });

        Sentry.captureException(error, {
          tags: {
            service: serviceName,
            operation,
          },
        });

        throw error;
      }
    }
  );
}

/**
 * Set custom user context for better debugging
 */
export function setUserContext(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Add custom tags to the current scope
 */
export function addCustomTags(tags: Record<string, string>) {
  Sentry.setTags(tags);
}

/**
 * Track page load performance
 */
export function trackPageLoad(pageName: string) {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;

      Sentry.setMeasurement('page_load_time', pageLoadTime, 'millisecond');
      Sentry.setMeasurement('dom_content_loaded', domContentLoaded, 'millisecond');

      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Page loaded: ${pageName}`,
        level: 'info',
        data: {
          pageLoadTime,
          domContentLoaded,
        },
      });
    });
  }
}
