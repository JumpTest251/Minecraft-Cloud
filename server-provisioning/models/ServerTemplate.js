const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const ProvisioningService = require('../provisioning/ProvisioningService');
const BackupService = require('../provisioning/backup/BackupService');
const { fromProvider } = require('../provisioning/providers/ServerProvider');
const Infrastructure = require('./Infrastructure');


const serverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 80
    },
    status: {
        type: String,
        default: 'creating'
    },
    createdBy: {
        type: String,
        required: true
    },
    templateType: {
        type: String,
        enum: ["static", "dynamic"],
        required: true
    },
    image: {
        type: String
    },
    provider: {
        type: String,
        enum: ["custom", "digitalocean", "hetzner"],
        required: true
    },
    gameType: {
        type: String,
        enum: ["minecraft"],
        required: true,
        default: "minecraft"
    },
    snapshot: String,
    memory: Number,
    port: {
        type: Number,
        default: 25565
    },
    version: String,
    serverType: String,
    infrastructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Infrastructure'
    },
    ftpAccount: {},
    backup: {},
    portMappings: [Number],
    members: [String]

}, { collation: { locale: 'en_US', strength: 2 } });

serverSchema.methods.isAvailable = function () {
    return ['started', 'stopped'].includes(this.status);
}
serverSchema.methods.isReady = function () {
    return ['started', 'stopped', 'paused'].includes(this.status);
}

serverSchema.methods.Service = function () {
    if (!this.provisioningService) {
        this.provisioningService = new ProvisioningService(this);
    }

    return this.provisioningService;
}

serverSchema.methods.Backup = function () {
    if (!this.backupService) {
        this.backupService = new BackupService(this);
    }

    return this.backupService;
}

serverSchema.statics.updateStatus = function (serverTemplate, status) {
    return ServerTemplate.findOneAndUpdate({ _id: serverTemplate._id }, { status })
}

serverSchema.statics.validate = function (serverTemplate, update = false) {
    const validations = {
        templateType: Joi.string().valid("static", "dynamic"),
        memory: Joi.number().positive().integer(),
        image: Joi.string().min(1).max(512),
        port: Joi.number().port(),
        version: Joi.string().min(3).max(10),
        serverType: Joi.string().valid("spigot", "vanilla", "bukkit", "paper", "custom")
    }
    if (serverTemplate.provider === 'custom') {
        validations.infrastructure = update ? Joi.objectId() : Joi.objectId().required();
    }

    if (!update) {
        validations.name = Joi.string().min(4).max(30).regex(/^[\w]+$/).required();
        validations.createdBy = Joi.string().max(512).required();
        validations.provider = Joi.string().valid("custom", "hetzner").required();
        validations.templateType = validations.templateType.required();
        validations.memory = validations.memory.required();
    }

    return Joi.validate(serverTemplate, validations);
}
serverSchema.statics.checkExists = async function (req, res, next) {
    let query = { name: req.params.server, createdBy: req.params.name };

    if (req.params.id) {
        const { error } = Joi.objectId().required().validate(req.params.id);
        if (error) return res.status(400).send({ error: 'Invalid id' });

        query = { _id: req.params.id };
    }

    const dbTemplate = await ServerTemplate.findOne(query).select('-__v');
    if (!dbTemplate) return res.status(404).send({ error: "ServerTemplate not found" });

    req.serverTemplate = dbTemplate;
    next();
}

serverSchema.statics.verify = function (update = false) {
    return async (req, res, next) => {
        const { error } = ServerTemplate.validate(req.body, update);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const name = req.body.name || req.params.server;
        const createdBy = req.body.createdBy || req.params.name;

        const dbTemplate = await ServerTemplate.findOne({ name, createdBy });
        if (!update && dbTemplate)
            return res.status(400).send({ error: "A template with that name already exists" });

        const provider = req.body.provider || dbTemplate.provider;
        if (provider === 'digitalocean' || provider === 'hetzner') {
            if (!fromProvider(provider).isValidSize(req.body.memory)) return res.status(400).send({ error: "Memory unavailable for provider" });
            if (dbTemplate && req.body.memory && req.body.memory < dbTemplate.memory && dbTemplate.templateType === 'static')
                return res.status(400).send({ error: 'Cannot decrease memory' })

        }
        if (provider === 'custom' && !update) {
            if (! await Infrastructure.findOne({ _id: req.body.infrastructure, managedId: null }))
                return res.status(404).send({ error: "Infrastructure not found" })
        }

        next();
    }
}

const ServerTemplate = mongoose.model("ServerTemplate", serverSchema);

module.exports = ServerTemplate;

