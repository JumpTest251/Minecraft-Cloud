const crypto = require('crypto');
const { promisify } = require('util');
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const randomBytes = promisify(crypto.randomBytes);

const analyticsTokenSchema = new mongoose.Schema({
    server: mongoose.Schema.Types.ObjectId,
    token: {
        type: String,
        unique: true
    },
    autopause: {
        type: Boolean,
        default: false
    }
});

analyticsTokenSchema.statics.generateToken = async function (server) {
    const token = (await randomBytes(16)).toString('hex');

    const analyticsToken = new AnalyticsToken({ server, token });
    await analyticsToken.save();

    return token;
}

analyticsTokenSchema.statics.verifySetup = async function (req, res, next) {
    const analytics = await AnalyticsToken.findOne({ server: req.body.server });
    if (analytics) return res.status(400).send({ error: "Analytics already setup." });

    next();
}

analyticsTokenSchema.statics.validate = function (at) {
    return Joi.object({
        autopause: Joi.boolean().required()
    }).validate(at);
}


analyticsTokenSchema.statics.validateId = function (location, object = 'server') {
    return async (req, res, next) => {
        const { error } = Joi.objectId().required().validate(req[location][object]);
        if (error) return res.status(400).send({ error: error.details[0].message });

        next();
    }
}

analyticsTokenSchema.statics.checkExists = async function (req, res, next) {
    const analyticsToken = await AnalyticsToken.findOne({ server: req.server._id }).select('-__v');
    if (!analyticsToken) return res.status(404).send({ error: "AnalyticsToken not found" });

    req.analyticsToken = analyticsToken;
    next();
}

analyticsTokenSchema.statics.verify = async function (req, res, next) {
    const token = await AnalyticsToken.findOne({ server: req.body.server, token: req.body.token });
    if (!token) return res.status(401).send({ error: "Invalid token" });

    req.token = token;
    next();
}


const AnalyticsToken = mongoose.model("AnalyticsToken", analyticsTokenSchema);

module.exports = AnalyticsToken;