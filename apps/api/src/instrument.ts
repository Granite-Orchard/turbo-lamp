import * as dotenv from 'dotenv';
import * as Sentry from '@sentry/nestjs';

if (process.env.NODE_ENV == 'production') {
  dotenv.config({ path: ['.env.local', '.env'] });
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      Sentry.consoleLoggingIntegration({
        levels: ['warn', 'error'],
      }),
    ],
    environment: process.env.NODE_ENV ?? 'development',

    // Send structured logs to Sentry
    enableLogs: true,
    // Tracing
    tracesSampleRate: 0.1,
    profileSessionSampleRate: 0.1,
    profileLifecycle: 'trace',
    sendDefaultPii: true,
  });
}
