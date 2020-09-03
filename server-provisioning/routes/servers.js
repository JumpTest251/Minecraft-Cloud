const express = require('express');
const router = express.Router();
const ServerTemplate = require('../models/ServerTemplate');
const axios = require('axios');
const config = require('../utils/config');
const { authentication, authManager } = require('@jumper251/core-module');

const middleware = [authentication, authentication.active, authentication.permission({ access: authManager.permissions.serverLookup })];

router.get("/:name", middleware, async (req, res) => {
    const templates = await ServerTemplate.find({ createdBy: req.params.name }).select("-__v");

    res.send(templates);

});

router.get("/:name/:server", middleware, async (req, res) => {
    const serverTemplate = await ServerTemplate.findOne({ name: req.params.server, createdBy: req.params.name }).select("-__v");
    if (!serverTemplate) return res.status(404).send({ error: "ServerTemplate not found" });

    res.send(serverTemplate);

});

router.post("/", [authentication, authentication.active, ServerTemplate.verify], async (req, res) => {
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
    
    if (serverTemplate.templateType === 'dynamic') serverTemplate.image = req.body.image;


    await serverTemplate.save();
    serverTemplate.Service().create();

    return res.status(201).send(serverTemplate);

});

router.put("/:name/:server", middleware, async (req, res) => {
    const { error } = ServerTemplate.validatePaused(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const updatedTemplate = await ServerTemplate.findOneAndUpdate({ name: req.params.server, createdBy: req.params.name }, {
        paused: req.body.paused
    });
    if (!updatedTemplate) return res.status(404).send({ error: "ServerTemplate not found" });

    res.send({ message: "ServerTemplate updated" });

});

router.delete("/:name/:server", middleware, async (req, res) => {
    const result = await ServerTemplate.deleteOne({ name: req.params.server, createdBy: req.params.name });

    res.send({ message: "ServerTemplate deleted", removed: result.deletedCount });
});


function retrieveUser(name, header) {
    return axios.get(config.userServiceUrl + "/users/" + name, {
        headers: {
            Authorization: header
        }
    });
}

module.exports = router;