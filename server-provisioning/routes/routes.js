const express = require('express');
const {loggingMiddleware, errorMiddleware, corsMiddleware, sentry} = require('@jumper251/core-module');
const helmet = require('helmet');
const compression = require('compression');
const servers = require('./servers');
const infrastructure = require('./infrastructure');
const {arena, authArena} = require('./arena');

module.exports.setupRoutes = function (app) {
    app.use(express.json());

    app.use([sentry.requestHandler, sentry.tracingHandler]);

    app.use(loggingMiddleware);
    app.use(corsMiddleware);
    app.use("/servers", servers);
    app.use("/infrastructure", infrastructure);

    app.use('/arena', [authArena, arena]);

    app.use(sentry.errorHandler);
    app.use(errorMiddleware);

    if (process.env.NODE_ENV === "production") {
        app.use(helmet());
        app.use(compression());
    }
}