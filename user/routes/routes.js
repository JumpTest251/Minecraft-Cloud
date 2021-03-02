const express = require('express');
const users = require('./users');
const { loggingMiddleware, errorMiddleware, corsMiddleware, sentry } = require('@jumper251/core-module');
const helmet = require('helmet');
const compression = require('compression');
const login = require("./login");
const reset = require("./reset");

module.exports.setupRoutes = function (app) {
    app.use(express.json());

    app.use([sentry.requestHandler, sentry.tracingHandler]);

    app.use(loggingMiddleware);
    app.use(corsMiddleware);
    app.use("/users", users);
    app.use("/auth", login);
    app.use("/auth/reset", reset);

    app.use(sentry.errorHandler);
    app.use(errorMiddleware);

    if (process.env.NODE_ENV === "production") {
        app.use(helmet());
        app.use(compression());
    }
}