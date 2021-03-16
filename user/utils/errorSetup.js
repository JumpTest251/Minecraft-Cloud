const { sentry } = require('@jumper251/core-module');

module.exports = function (app) {
    sentry.setupSentry({
        app,
        handleException: true,
        handleRejection: true,
        tracing: true,
        onlyProduction: true
    })
}
