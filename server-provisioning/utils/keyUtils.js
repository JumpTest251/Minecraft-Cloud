const { generateKeyPair } = require('crypto');
const sshpk = require('sshpk');

module.exports.generateKeyPair = function () {
    return new Promise((resolve, reject) => {
        generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        }, (err, publicKey, privateKey) => {
            if (err) {
                reject(err);
            } else {
                const sshRsa = sshpk.parseKey(publicKey, 'pem').toString('ssh');
                resolve({
                    publicKey: sshRsa,
                    privateKey
                });
            }
        });
    })
}