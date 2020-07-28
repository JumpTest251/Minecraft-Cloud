const Joi = require('joi');
const mongoose = require('mongoose');
const { tokenGenerator } = require('@jumper251/core-module');
const bcrypt = require('bcryptjs');
const twoFactorAuth = require('../utils/twoFactorAuth');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 512
    },
    active: {
        type: Boolean,
        default: false
    },
    twofa: {
        enabled: {
            type: Boolean,
            default: false
        },
        identity: String
    },
    roles: {
        type: [String],
        default: ["User"]
    }
});

userSchema.methods.generateToken = function () {
    return tokenGenerator.generateExpiringToken({
        username: this.name,
        active: this.active,
        roles: this.roles
    }, "15s");
}

userSchema.methods.generateRefreshToken = function () {
    return tokenGenerator.generateToken({ username: this.name });
}

userSchema.methods.encryptPassword = async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
}

userSchema.methods.matchPassword = async function (match) {
    return await bcrypt.compare(match, this.password);
}

userSchema.methods.updateData = async function (user) {
    const { password, twofa } = user;

    if (password) {
        this.password = user.password;
        await this.encryptPassword();
    }

    if (twofa) {
        const { enabled, otp } = twofa;
        this.twofa.enabled = enabled;

        if (enabled) {
            const result = await twoFactorAuth.verify(otp);
            if (!result.valid) throw "Invalid OTP";

            this.twofa.identity = result.identity
        } else {
            this.twofa.identity = '';
        }
    }

    await this.save();
}

userSchema.statics.validate = function (user) {
    return Joi.validate(user, {
        name: Joi.string().min(3).max(25).regex(/^[\w]+$/).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(512).required()
    });
}

userSchema.statics.validateUpdate = function (user) {
    return Joi.validate(user, {
        password: Joi.string().min(6).max(512),
        twofa: Joi.object().keys({
            enabled: Joi.boolean().required(),
            otp: Joi.string()
        })
    });
}

const User = mongoose.model('User', userSchema);

module.exports = User;