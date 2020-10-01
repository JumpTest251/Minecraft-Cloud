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
        },
        {
            name: 'ftpQueue',
            hostId: 'Provisioning Server',
            type: 'bee',
            redis: {
                url: config.redisUrl
            }
        },
        {
            name: 'setupMinecraft',
            hostId: 'Provisioning Server',
            type: 'bee',
            redis: {
                url: config.redisUrl
            }
        },
        {
            name: 'pauseMinecraft',
            hostId: 'Provisioning Server',
            type: 'bee',
            redis: {
                url: config.redisUrl
            }
        },
        {
            name: 'stopMinecraft',
            hostId: 'Provisioning Server',
            type: 'bee',
            redis: {
                url: config.redisUrl
            }
        },
        {
            name: 'commandQueue',
            hostId: 'Provisioning Server',
            type: 'bee',
            redis: {
                url: config.redisUrl
            }
        },
        {
            name: 'logQueue',
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

