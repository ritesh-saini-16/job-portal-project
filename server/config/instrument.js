import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://383485fb7e4847381f2c88b469bc6e98@o4511135323324416.ingest.us.sentry.io/4511135328501760",
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});

export default Sentry;
