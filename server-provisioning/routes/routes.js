const express = require('express');
const {loggingMiddleware, errorMiddleware, corsMiddleware} = require('@jumper251/core-module');
const helmet = require('helmet');
const compression = require('compression');
const servers = require('./servers');
const arena = require('./arena');

module.exports.setupRoutes = function (app) {
    app.use(express.json());

    app.use(loggingMiddleware);
    app.use(corsMiddleware);
    app.use("/servers", servers);

    app.use('/arena', arena);
    app.use(errorMiddleware);

    if (process.env.NODE_ENV === "production") {
        app.use(helmet());
        app.use(compression());
    }
}