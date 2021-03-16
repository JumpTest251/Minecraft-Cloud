const ServerTemplate = require('../models/ServerTemplate');
const Queue = require('bee-queue');
const QueueType = require('../provisioning/queues');
const config = require('../utils/config');
const Joi = require('joi');
const { MinecraftServer } = require('mcping-js');
const { Cache } = require('@jumper251/core-module').caching;

const queueConfig = {
    redis: {
        url: config.redisUrl
    },
    isWorker: false
}

const commandQueue = new Queue(QueueType.CommandQueue, queueConfig);
const logQueue = new Queue(QueueType.LogQueue, queueConfig);

module.exports.actionHandler = async (req, res) => {
    const type = req.body.type;
    if (!req.serverTemplate.isReady()) return res.status(400).send({ error: "Action unavailable for server" });


    if (type === 'pause') {
        if (req.serverTemplate.provider === 'custom' || !req.serverTemplate.isAvailable())
            return res.status(400).send({ error: "Action unavailable for server" })

        await ServerTemplate.updateStatus(req.serverTemplate, 'pausing');
        req.serverTemplate.Service().pause();

        res.send({ message: 'Server pause initiated' });

    } else if (type === 'start') {
        if (req.serverTemplate.status === 'paused') {
            await ServerTemplate.updateStatus(req.serverTemplate, 'creating');

            req.serverTemplate.Service().setupInfrastructure();
        } else if (req.serverTemplate.status === 'stopped') {
            await ServerTemplate.updateStatus(req.serverTemplate, 'starting');

            req.serverTemplate.Service().startServer(req.serverTemplate.infrastructure);
        }

        res.send({ message: 'Server starting' })

    } else if (type === 'stop' || type === 'restart') {
        if (req.serverTemplate.status === 'started') {
            await ServerTemplate.updateStatus(req.serverTemplate, 'stopped');

            req.serverTemplate.Service().stopServer(type === 'restart');
        }

        res.send({ message: 'Sending action to server' })

    } else {
        res.status(400).send({ error: 'Invalid type' });
    }
}

module.exports.commandHandler = async (req, res) => {
    const { error } = Joi.string().required().trim().min(1).max(500).validate(req.body.command);
    if (error) return res.status(400).send({ error: error.details[0].message })

    const command = req.body.command.trim();
    if (req.serverTemplate.status !== 'started') return res.status(400).send({ error: 'Server must be online' })

    const executor = commandQueue.createJob({ serverTemplate: req.serverTemplate, command });
    await executor.save();

    executor.on('succeeded', data => res.send({ message: data }))
    executor.on('failed', () => res.status(500).send({ error: 'Error executing command' }))
}

module.exports.logHandler = async (req, res) => {
    const logs = logQueue.createJob({ serverTemplate: req.serverTemplate });
    await logs.save();

    logs.on('succeeded', data => data ? res.send(data) : res.end());
    logs.on('failed', () => res.status(500).send({ error: 'Error retrieving logs' }))
}

module.exports.pingHandler = async (req, res) => {
    const pingCache = new Cache(`mcstatus-${req.serverTemplate.Service().hostname()}`, 5);

    const status = await pingCache.get(() => pingServer(req.serverTemplate.Service().hostname(), req.serverTemplate.port));

    res.send(status);
}

function pingServer(hostname, port) {
    return new Promise(resolve => {
        const server = new MinecraftServer(hostname, port);

        server.ping(4000, '47', (err, data) => {
            if (err || !data) return resolve();

            resolve(data);
        })
    })
}




