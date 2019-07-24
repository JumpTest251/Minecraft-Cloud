const express = require('express');
const router = express.Router();
const ServerTemplate = require('../models/ServerTemplate');
const axios = require('axios');
const config = require('../utils/config');
const {authentication, authManager} = require('@jumper251/core-module');

router.get("/:username", authentication, async (req, res) => {
    if (req.user.username === req.params.username || await authManager.canAccess(req.user, "userLookup")) {
        const templates = await ServerTemplate.find({createdBy: req.params.username}).select("-__v");

        res.send(templates);
    } else {
        res.status(403).send({error: "Access forbidden: cannot lookup servers"})
    }
});

router.get("/:username/:server", authentication, async (req, res) => {
    if (req.user.username === req.params.username || await authManager.canAccess(req.user, "userLookup")) {
        const serverTemplate = await ServerTemplate.findOne({name: req.params.server, createdBy: req.params.username}).select("-__v");
        if (!serverTemplate) return res.status(404).send({error: "ServerTemplate not found"});

        res.send(serverTemplate);
    } else {
        res.status(403).send({error: "Access forbidden: cannot lookup server"})
    }
});

router.post("/", [authentication, ServerTemplate.verify], async (req, res) => {
    try {
        await retrieveUser(req.body.createdBy, req.header("Authorization"));
    } catch(ex) {
        return res.status(ex.response.status).send(ex.response.data);
    }
    
    const serverTemplate = new ServerTemplate({
        name: req.body.name,
        createdBy: req.body.createdBy,
        templateType: req.body.templateType
    });

    await serverTemplate.save();

    return res.status(201).send(serverTemplate);

});

router.put("/", authentication, async (req, res) => {
    const {error} = ServerTemplate.validatePaused(req.body);
    if (error) return res.status(400).send({error: error.details[0].message});

    if (req.user.username === req.body.createdBy || await authManager.canAccess(req.user, "userLookup")) {

        const updatedTemplate = await ServerTemplate.findOneAndUpdate({name: req.body.name, createdBy: req.body.createdBy}, {
            paused: req.body.paused
        });
        if (!updatedTemplate) return res.status(404).send({error: "ServerTemplate not found"});

        res.send({message: "ServerTemplate updated"});
    } else {
        res.status(403).send({error: "Access forbidden: cannot update server"})
    }

});

router.delete("/:username/:server", authentication, async (req, res) => {
    if (req.user.username === req.params.username || await authManager.canAccess(req.user, "userLookup")) {

        const result = await ServerTemplate.deleteOne({name: req.params.server, createdBy: req.params.username});

        res.send({message: "ServerTemplate deleted", removed: result.deletedCount});

    } else {
        res.status(403).send({error: "Access forbidden: cannot delete server"})

    }

});

function retrieveUser(name, header) {
    return axios.get(config.userServiceUrl + "/api/users/" + name, {
        headers: {
            Authorization: header
        }
    });
}

module.exports = router;