const express = require('express');
const router = express.Router();

const AnalyticsToken = require('../models/AnalyticsToken');
const Metrics = require('../models/Metrics');
const { reportingRate } = require('../utils/config');
const { caching: { Cache } } = require('@jumper251/core-module');

router.post('/', [AnalyticsToken.validateId('body'), AnalyticsToken.verify], async (req, res) => {
    const metrics = new Metrics(req.body.metrics, req.body.server);
    const { error } = metrics.validate();
    if (error) return res.status(400).send({ error: error.details[0].message });

    const lastCached = new Cache(`analytics:last:${req.body.token}`, reportingRate - 2, false);
    const result = await lastCached.get();
    if (result) return res.status(429).send({ error: 'To many metric reports' });
    await lastCached.set(new Date().getTime());

    await metrics.insert();

    metrics.analyzer().analyze(req.token);

    res.status(201).send({ message: 'Metrics reported' });
})



module.exports = router; 