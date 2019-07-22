const Joi = require('joi');
const mongoose = require('mongoose');
const config = require('../utils/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
    roles: {
        type: [String],
        default: ["User"]
    }
});

userSchema.methods.generateToken = function() {
    return jwt.sign({
        username: this.name,
        active: this.active,
        roles: this.roles
    }, config.jwtPrivateKey)
}

userSchema.methods.encryptPassword = async function() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
}

userSchema.methods.matchPassword = async function(match) {
    return await bcrypt.compare(match, this.password);
}

userSchema.statics.validate = function(user) {
    return Joi.validate(user, {
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(512).required()
    });
}

userSchema.statics.validatePassword = function(user) {
    return Joi.validate(user, {
        password: Joi.string().min(6).max(512).required()
    });
}

const User = mongoose.model('User', userSchema);

module.exports = User;