const express = require('express');
const router = express.Router();

const AnalyticsToken = require('../models/AnalyticsToken');
const Metrics = require('../models/Metrics');
const { authentication, authManager } = require('@jumper251/core-module');
const axios = require('axios');
const config = require('../utils/config');

const middleware = [authentication, authentication.active, authentication.permission({ access: authManager.accessPoints.serverUpdate })];


router.post('/', [middleware, AnalyticsToken.validateId('body'), AnalyticsToken.verifySetup], async (req, res) => {
    const token = await AnalyticsToken.generateToken(req.body.server);

    res.status(201).send({ token });
})

router.get('/:name/:server', [authentication, authentication.active, authCheck, AnalyticsToken.checkExists], async (req, res) => {
    res.send({ ...req.analyticsToken, reportingRate: config.reportingRate })
})

router.get('/:name/:server/metrics', [authentication, authentication.active, authCheck], async (req, res) => {
    const serverId = req.server._id;

    const metrics = await Metrics.findMetrics(serverId);

    res.send(metrics.map(metric => ({
        time: metric._time,
        measurement: metric._measurement,
        field: metric._field,
        value: metric._value
    })));

})


router.put('/:name/:server', [authentication, authentication.active, authCheck], async (req, res) => {
    const { error } = AnalyticsToken.validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const updated = await AnalyticsToken.findOneAndUpdate({ server: req.server._id }, { autopause: req.body.autopause });
    if (!updated) return res.status(404).send({ error: "AnalyticsToken not found" });

    res.send({ message: "AnalyticsToken updated" });

})

router.delete('/:server', [middleware, AnalyticsToken.validateId('params')], async (req, res) => {
    const result = await AnalyticsToken.findOne({ server: req.params.server });
    if (!result) return res.status(404).send({ error: "AnalyticsToken not found" });

    await result.deleteOne();

    await Metrics.deleteMetrics(result._id);

    res.send({ message: 'AnalyticsToken deleted' });
})


function retrieveServer(server, header) {
    return axios.get(config.serverServiceUrl + "/servers/" + server.user + "/" + server.name, {
        headers: {
            Authorization: header
        }
    });
}

async function authCheck(req, res, next) {
    try {
        const server = await retrieveServer({ user: req.params.name, name: req.params.server }, req.header("Authorization"));

        req.server = server.data;
        next();
    } catch (ex) {
        console.log(ex)
        return res.status(ex.response.status).send(ex.response.data);
    }
}

module.exports = router; 