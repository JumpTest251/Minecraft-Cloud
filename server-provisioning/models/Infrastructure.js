const Joi = require('joi');
const mongoose = require('mongoose');

const infrastructureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 40
    },
    owner: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        set: v => Buffer.from(v).toString('base64'),
        get: v => Buffer.from(v, 'base64').toString('ascii')
    },
    managedId: String
});

infrastructureSchema.statics.validate = function (infrastructure) {
    return Joi.validate(infrastructure, {
        name: Joi.string().min(3).max(40).regex(/^[\w]+$/).required(),
        owner: Joi.string().max(512).required(),
        ip: Joi.string().ip({ version: 'ipv4' }).required(),
        username: Joi.string().max(512).required(),
        privateKey: Joi.string().max(5000).required()

    });
}


const Infrastructure = mongoose.model("Infrastructure", infrastructureSchema);

module.exports = Infrastructure;