const Arena = require('bull-arena');
const Bee = require('bee-queue');

const config = require('../utils/config');

module.exports = Arena({
    Bee,
    queues: [
        {
            name: 'setupDroplet',
            hostId: 'Provisioning Server',
            type: 'bee',
            redis: {
                url: config.redisUrl
            }
        }
    ],
},
    {
        disableListen: true
    }
);

