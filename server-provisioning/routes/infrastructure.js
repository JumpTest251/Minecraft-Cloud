const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Infrastructure = require('../models/Infrastructure');
const ServerTemplate = require('../models/ServerTemplate');
const { authentication, authManager } = require('@jumper251/core-module');

const middleware = [authentication, authentication.active, authentication.permission({ access: authManager.permissions.serverLookup })];

router.get("/user/:name", middleware, async (req, res) => {
    const infrastructure = await Infrastructure.find({ owner: req.params.name }).select("-__v -privateKey -username");

    res.send(infrastructure);
});

router.get("/:id", [authentication, authentication.active], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send({ error: "Invalid ID" })

    const infrastructure = await Infrastructure.findById(req.params.id).select("-privateKey -username -__v");
    if (!infrastructure) return res.status(404).send({ error: "Infrastructure not found" });

    if (! await authManager.canAccess(req.user, authManager.permissions.serverLookup, { requested: infrastructure.owner, actual: req.user.username })) {
        return res.status(403).send({ error: "Access denied" })
    }

    res.send(infrastructure);
})

router.post("/", [authentication, authentication.active, Infrastructure.verify], async (req, res) => {

    const infrastructure = new Infrastructure({
        name: req.body.name,
        owner: req.user.username,
        ip: req.body.ip,
        username: req.body.username,
        privateKey: req.body.privateKey
    });

    await infrastructure.save();

    return res.status(201).send(infrastructure);
});

router.put("/:name/:infrastructure", middleware, async (req, res) => {
    const { error } = Infrastructure.validate(req.body, true);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const updatedInfrastructure = await Infrastructure.findOneAndUpdate({ name: req.params.infrastructure, owner: req.params.name, managedId: null }, {
        ip: req.body.ip,
        username: req.body.username,
        privateKey: req.body.privateKey
    });
    if (!updatedInfrastructure) return res.status(404).send({ error: "Infrastructure not found" });

    res.send({ message: "Infrastructure updated" });
});

router.delete("/:name/:infrastructure", middleware, async (req, res) => {
    const toDelete = await Infrastructure.findOne({ name: req.params.infrastructure, owner: req.params.name });

    if (toDelete) {
        if (toDelete.managedId) return res.status(400).send({ error: "Can't remove managed Infrastructure" })

        const template = await ServerTemplate.findOne({ infrastructure: toDelete._id });
        if (template) return res.status(400).send({ error: "Infrastructure in use " + template.name });
    }

    const result = await Infrastructure.deleteOne({ name: req.params.infrastructure, owner: req.params.name });

    res.send({ message: "Infrastructure deleted", removed: result.deletedCount });
});



module.exports = router;