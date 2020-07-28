const Joi = require('joi');
const mongoose = require('mongoose');
const ProvisioningService = require('../provisioning/ProvisioningService');


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
        enum: ["static"],
        required: true
    },
    volumeClaim: {},
    deployment: {},
    service: {}

});

serverSchema.methods.Service = function() {
    if (!this.provisioningService) {
        this.provisioningService = new ProvisioningService(this);
    }

    return this.provisioningService;
}

serverSchema.statics.validate = function(serverTemplate) {
    return Joi.validate(serverTemplate, {
        name: Joi.string().min(4).max(30).regex(/^[\w]+$/).required(),
        createdBy: Joi.string().max(512).required(),
        templateType: Joi.string().valid("static").required()
    });
}

serverSchema.statics.validatePaused = function(serverTemplate) {
    return Joi.validate(serverTemplate, {
        paused: Joi.boolean().required()
    });
}

serverSchema.statics.verify = async function(req, res, next) {
    const {error} = ServerTemplate.validate(req.body);
    if (error) return res.status(400).send({error: error.details[0].message});

    const dbTemplate = await ServerTemplate.findOne({name: req.body.name, createdBy: req.body.createdBy});
    if (dbTemplate) return res.status(400).send({error: "A template with that name already exists"});

    next();

}

const ServerTemplate = mongoose.model("ServerTemplate", serverSchema);

module.exports = ServerTemplate;

