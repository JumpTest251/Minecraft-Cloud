const ServerTemplate = require('../models/ServerTemplate');
const gcloud = require('../provisioning/gcloud')
const Joi = require('joi');
const { Cache } = require('@jumper251/core-module').caching;

const generationRule = Joi.number().integer().positive().required();

module.exports.backupHandler = async (req, res) => {
    const { action, generation } = req.body;

    const { error } = generationRule.validate(generation);
    if (error) return res.status(400).send({ error: error.details[0].message });

    if (!req.serverTemplate.isAvailable()) return res.status(400).send({ error: "Action unavailable for server" });
    if (action !== 'restore') return res.status(400).send({ error: 'Invalid action' });

    await ServerTemplate.updateStatus(req.serverTemplate, 'restoring');
    await req.serverTemplate.Backup().restore(generation);

    res.send({ message: 'Restoring Server from backup' })
}

module.exports.listBackups = async (req, res) => {
    const prefix = gcloud.buildPrefix(req.serverTemplate);
    const fileCache = new Cache(`backuplist-${prefix}`, 120)

    const [files] = await fileCache.get(() => gcloud.listFiles(prefix, true))

    res.send(getBackups(files))
}

module.exports.createUrl = async (req, res) => {
    const { generation } = req.params;

    const { error } = generationRule.validate(generation);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const urlCache = new Cache(`backupurl-${gcloud.buildPrefix(req.serverTemplate)}:${generation}`, 1800)

    const [url] = await urlCache.get(() => gcloud.createSignedUrl(gcloud.buildPrefix(req.serverTemplate, true), generation))
    res.send({ url })
}

module.exports.toggleBackup = async (req, res) => {
    const { enable } = req.body;

    const { error } = Joi.boolean().required().validate(enable);
    if (error) return res.status(400).send({ error: error.details[0].message });

    if (req.serverTemplate.templateType === 'dynamic' || req.serverTemplate.provider === 'custom')
        return res.status(400).send({ error: 'Backups are not available for this server' })

    req.serverTemplate.backup = { ...req.serverTemplate.backup, enabled: enable }
    await req.serverTemplate.save();

    res.send({ message: 'Backups ' + (enable ? 'enabled' : 'disabled') })
}


function getBackups(files) {
    return files.map(file => ({
        name: file.metadata.name,
        created: file.metadata.timeCreated,
        size: file.metadata.size,
        generation: file.metadata.generation
    }))
}