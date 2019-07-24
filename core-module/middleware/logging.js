const moment = require('moment');

module.exports = function(req, res, next) {
    const url = req.originalUrl;
    console.log("[" + moment().format("YYYY-MM-DD HH:mm:ss") + "]: " + url);

    next();
}