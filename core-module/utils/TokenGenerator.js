const jwt = require('jsonwebtoken');
const config = require('./config');

const TokenGenerator = function() {

}

TokenGenerator.prototype.generateToken = function(payload) {
    return jwt.sign(payload, config.jwtPrivateKey);
}

TokenGenerator.prototype.generateServiceToken = function(cache) {
    if (!this.serviceToken || !cache) {
        this.serviceToken =  jwt.sign({
            username: "ServiceAccount",
            active: true,
            roles: ["Service"]
        }, config.jwtPrivateKey);
    }

    return this.serviceToken;
}

const tokenGenerator = new TokenGenerator();

module.exports = tokenGenerator;
