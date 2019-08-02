const express = require('express');
const users = require('./users');
const { loggingMiddleware, errorMiddleware, corsMiddleware } = require('@jumper251/core-module');
const helmet = require('helmet');
const compression = require('compression');
const login = require("./login");

module.exports.setupRoutes = function (app) {
    app.use(express.json());

    app.use(loggingMiddleware);
    app.use(corsMiddleware);
    app.use("/api/users", users);
    app.use("/api/auth", login);

    app.use(errorMiddleware);

    if (process.env.NODE_ENV === "production") {
        app.use(helmet());
        app.use(compression());
    }
}