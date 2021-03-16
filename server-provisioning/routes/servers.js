const express = require('express');
const router = express.Router();
const controls = require('./controls');
const backup = require('./backup')

const ServerTemplate = require('../models/ServerTemplate');
const axios = require('axios');
const config = require('../utils/config');
const { authentication, authManager } = require('@jumper251/core-module');
const { caching: { CachedSet } } = require('@jumper251/core-module');
const { createAnalytics, deleteAnalytics } = require('../utils/serviceRequestor');

const middleware = [authentication, authentication.active, authentication.permission({ access: authManager.Permission.ServerLookup })];


router.get("/:name", middleware, async (req, res) => {
    const templates = await ServerTemplate.find({ createdBy: req.params.name }).select("-__v");

    res.send(templates);
});

router.get('/:id/id', [middleware, ServerTemplate.checkExists], async (req, res) => {
    res.send(req.serverTemplate);
})

router.get("/:name/:server", [middleware, ServerTemplate.checkExists], async (req, res) => {
    res.send(req.serverTemplate);
});


router.post("/", [authentication, authentication.active, ServerTemplate.verify()], async (req, res) => {
    try {
        await retrieveUser(req.body.createdBy, req.header("Authorization"));
    } catch (ex) {
        return res.status(ex.response.status).send(ex.response.data);
    }

    const serverTemplate = new ServerTemplate({
        name: req.body.name,
        createdBy: req.body.createdBy,
        templateType: req.body.templateType,
        memory: req.body.memory,
        provider: req.body.provider,
        port: req.body.port
    });
    if (req.body.version) serverTemplate.version = req.body.version;
    if (req.body.serverType) serverTemplate.serverType = req.body.serverType;

    if (serverTemplate.templateType === 'dynamic') serverTemplate.image = req.body.image;
    if (serverTemplate.provider === 'custom') serverTemplate.infrastructure = req.body.infrastructure;

    await serverTemplate.save();
    serverTemplate.Service().create();

    createAnalytics(serverTemplate._id);

    return res.status(201).send(serverTemplate);
});

router.put("/:name/:server", [middleware, ServerTemplate.verify(true)], async (req, res) => {
    const updatedTemplate = await ServerTemplate.findOneAndUpdate({ name: req.params.server, createdBy: req.params.name }, req.body);
    if (!updatedTemplate) return res.status(404).send({ error: "ServerTemplate not found" });

    const recent = new CachedSet('recentlyUpdated')
    await recent.add(updatedTemplate._id.toString())

    res.send({ message: "ServerTemplate updated" });
});

router.delete("/:name/:server", middleware, async (req, res) => {
    const result = await ServerTemplate.findOne({ name: req.params.server, createdBy: req.params.name });
    if (!result) return res.status(404).send({ error: "ServerTemplate not found" });

    if (!result.isReady()) return res.status(400).send({ error: 'Server is still performing actions' });


    await result.Service().cleanup();
    result.Backup().cleanup();

    await result.deleteOne();

    await deleteAnalytics(result._id);

    res.send({ message: "ServerTemplate deleted" });
});


function retrieveUser(name, header) {
    return axios.get(config.userServiceUrl + "/users/" + name, {
        headers: {
            Authorization: header
        }
    });
}

router.post('/:name/:server/action', [middleware, ServerTemplate.checkExists], controls.actionHandler);
router.post('/:name/:server/exec', [middleware, ServerTemplate.checkExists], controls.commandHandler);
router.get('/:name/:server/logs', [middleware, ServerTemplate.checkExists], controls.logHandler);
router.get('/:name/:server/status', [middleware, ServerTemplate.checkExists], controls.pingHandler);

router.post('/:name/:server/backup', [middleware, ServerTemplate.checkExists], backup.backupHandler);
router.get('/:name/:server/backup', [middleware, ServerTemplate.checkExists], backup.listBackups);
router.get('/:name/:server/backup/:generation', [middleware, ServerTemplate.checkExists], backup.createUrl);
router.patch('/:name/:server/backup/', [middleware, ServerTemplate.checkExists], backup.toggleBackup);

module.exports = router;