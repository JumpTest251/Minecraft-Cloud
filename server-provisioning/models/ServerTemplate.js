const Joi = require('joi');
const mongoose = require('mongoose');
const ProvisioningService = require('../provisioning/ProvisioningService');
const digitaloceanProvider = require('../provisioning/DigitaloceanProvider');


const serverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 80
    },
    paused: {
        type: Boolean,
        default: false
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
        enum: ["custom", "digitalocean"],
        default: 'digitalocean'
    },
    snapshot: String,
    memory: Number,
    port: {
        type: Number,
        default: 25565
    },
    infrastructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Infrastructure'
    },
    members: [String]

});

serverSchema.methods.Service = function () {
    if (!this.provisioningService) {
        this.provisioningService = new ProvisioningService(this);
    }

    return this.provisioningService;
}

serverSchema.statics.validate = function (serverTemplate) {
    return Joi.validate(serverTemplate, {
        name: Joi.string().min(4).max(30).regex(/^[\w]+$/).required(),
        createdBy: Joi.string().max(512).required(),
        templateType: Joi.string().valid("static", "dynamic").required(),
        provider: Joi.string().valid("custom", "digitalocean").required(),
        memory: Joi.number().positive().integer().required(),
        image: Joi.string().min(1).max(512),
        port: Joi.number().port()

    });
}

serverSchema.statics.validatePaused = function (serverTemplate) {
    return Joi.validate(serverTemplate, {
        paused: Joi.boolean().required()
    });
}

serverSchema.statics.verify = async function (req, res, next) {
    const { error } = ServerTemplate.validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const dbTemplate = await ServerTemplate.findOne({ name: req.body.name, createdBy: req.body.createdBy });
    if (dbTemplate) return res.status(400).send({ error: "A template with that name already exists" });

    if (req.body.provider === 'digitalocean' && !digitaloceanProvider.isValidSize(req.body.memory)) return res.status(400).send({ error: "Memory unavailable for provider" });

    next();
}

const ServerTemplate = mongoose.model("ServerTemplate", serverSchema);

module.exports = ServerTemplate;

