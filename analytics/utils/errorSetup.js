const { sentry } = require('@jumper251/core-module');

module.exports = function (app) {
    sentry.setupSentry({
        app,
        handleException: true,
        handleRejection: true,
        tracing: true,
        onlyProduction: true,
        customFilter: (context) => {
            if (context.url && context.url.includes('/analytics/report')) return 0;
            return 1;
        }
    })
}
