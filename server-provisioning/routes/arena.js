const Arena = require('bull-arena');
const Bee = require('bee-queue');

const config = require('../utils/config');
const QueueType = require('../provisioning/queues');

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

const queues = Object.values(QueueType).map(queue => {
    return ({
        name: queue,
        hostId: 'Provisioning Server',
        type: 'bee',
        redis: {
            url: config.redisUrl
        }
    })
})

module.exports.arena = Arena({
    Bee,
    queues,
},
    {
        disableListen: true
    }
);

