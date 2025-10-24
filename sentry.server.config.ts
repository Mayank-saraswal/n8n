// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://68b3fd661317dc8870bf23875b591c04@o4510244216832000.ingest.us.sentry.io/4510244218601472",
  
  integrations: [
    // Add the Vercel AI SDK integration to sentry.server.config.ts
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),

    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  
  // Tracing must be enabled for agent monitoring to work
  tracesSampleRate: 1.0,
  
  // Enable logs to be sent to Sentry
  enableLogs: true,
  
  // Send default PII (personally identifiable information)
  sendDefaultPii: true,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
