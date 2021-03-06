const express = require('express');
const { loggingMiddleware, errorMiddleware, corsMiddleware, sentry } = require('@jumper251/core-module');
const helmet = require('helmet');
const compression = require('compression');

const ingestion = require('./ingestion');
const analytics = require('./analytics');


module.exports.setupRoutes = function (app) {
    app.use(express.json());

    app.use([sentry.requestHandler, sentry.tracingHandler]);

    app.use(loggingMiddleware);
    app.use(corsMiddleware);

    app.use('/analytics/report', ingestion);
    app.use('/analytics/server', analytics);

    app.use(sentry.errorHandler);
    app.use(errorMiddleware);

    if (process.env.NODE_ENV === "production") {
        app.use(helmet());
        app.use(compression());
    }
}