const jwt = require('jsonwebtoken');
const config = require('./config');

const TokenGenerator = function () {

}

TokenGenerator.prototype.generateToken = function (payload) {
    return jwt.sign(payload, config.jwtPrivateKey);
}

TokenGenerator.prototype.generateExpiringToken = function (payload, expires) {
    return jwt.sign(payload, config.jwtPrivateKey, { expiresIn: expires });
}

TokenGenerator.prototype.verify = function (token) {
    return new Promise(resolve => {
        jwt.verify(token, config.jwtPrivateKey, function (err, decoded) {
            if (err) resolve({ error: true });

            resolve(decoded);
        });
    })


}

TokenGenerator.prototype.generateServiceToken = function (cache) {
    if (!this.serviceToken || !cache) {
        this.serviceToken = jwt.sign({
            username: "ServiceAccount",
            active: true,
            roles: ["Service"]
        }, config.jwtPrivateKey);
    }

    return this.serviceToken;
}

const tokenGenerator = new TokenGenerator();

module.exports = tokenGenerator;
