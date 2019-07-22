const moment = require('moment');
const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    const url = req.originalUrl;
    console.log("[" + moment().format("YYYY-MM-DD HH:mm:ss") + "]: " + url);

    next();
});

module.exports = router;