const Arena = require('bull-arena');
const Bee = require('bee-queue');

const config = require('../utils/config');

module.exports.authArena = (req, res, next) => {
    const auth = { login: config.arenaUser, password: config.arenaPassword };

    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');


    if (login && password && login === auth.login && password === auth.password) {
        return next()
    }

    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
}

module.exports.arena = Arena({
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
            name: 'metricQueue',
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
        },
        {
            name: 'backupQueue',
            hostId: 'Provisioning Server',
            type: 'bee',
            redis: {
                url: config.redisUrl
            }
        },
        {
            name: 'restoreQueue',
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

