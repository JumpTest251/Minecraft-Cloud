const yub = require('yub');
const config = require('../utils/config');

const TwoFactorAuth = function() {
    yub.init(config.yubClient, config.yubSecret);
    this.pendingAuthentications = [];

}


TwoFactorAuth.prototype.verify = function(otp) {
    return new Promise((resolve, reject) => {
        yub.verify(otp, function(err, data) {
            if (err) {
                reject(err);
            }

            resolve(data);
        })
    });
}

TwoFactorAuth.prototype.compareIdentity = async function(otp, identity) {
    const data = await this.verify(otp);

    return data.valid && data.identity === identity;
}

TwoFactorAuth.prototype.addPending = function(user) {
    this.pendingAuthentications.push(user);
}

TwoFactorAuth.prototype.find = function(name) {
    return this.pendingAuthentications.find(obj => obj.name === name);
}

TwoFactorAuth.prototype.removePending = function(name) {
    this.pendingAuthentications = this.pendingAuthentications.filter(obj => obj.name !== name);
}

module.exports = new TwoFactorAuth();