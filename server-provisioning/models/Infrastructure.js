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

infrastructureSchema.statics.validate = function (infrastructure, update = false) {
    return Joi.validate(infrastructure, {
        name: !update ? Joi.string().min(3).max(40).regex(/^[\w]+$/).required() : Joi.string(),
        ip: Joi.string().ip({ version: 'ipv4' }).required(),
        username: Joi.string().max(512).required(),
        privateKey: Joi.string().max(5000).required()

    });
}


infrastructureSchema.statics.verify = async function (req, res, next) {
    const { error } = Infrastructure.validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const dbInfrastructure = await Infrastructure.findOne({ name: req.body.name, owner: req.user.username });
    if (dbInfrastructure) return res.status(400).send({ error: "An Infrastructure with that name already exists" });

    next();
}

const Infrastructure = mongoose.model("Infrastructure", infrastructureSchema);

module.exports = Infrastructure;