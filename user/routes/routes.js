const express = require('express');
const users = require('./users');
const logging = require('../middleware/logging');
const helmet = require('helmet');
const compression = require('compression');
const error = require("../middleware/error");
const login = require("./login");

module.exports.setupRoutes = function (app) {
    app.use(express.json());

    app.use(logging);
    app.use("/api/users", users);
    app.use("/api/auth", login);

    app.use(error);

    if (process.env.NODE_ENV === "production") {
        app.use(helmet());
        app.use(compression());
    }
}