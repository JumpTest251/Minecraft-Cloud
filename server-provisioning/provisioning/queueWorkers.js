const config = require('../utils/config');

const Queue = require('bee-queue');
const provisioningWorker = require('./provisioningWorker');
const ftpWorker = require('./ftpWorker');
const minecraftWorker = require('./minecraft/minecraftWorker');
const controlQueues = require('./minecraft/minecraftControls');

const queueConfig = {
    redis: {
        url: config.redisUrl
    }
}
const doQueue = new Queue('setupDroplet', queueConfig);
const ftpQueue = new Queue('ftpQueue', queueConfig);
const mcQueue = new Queue('setupMinecraft', queueConfig);
const pauseQueue = new Queue('pauseMinecraft', queueConfig);
const stopQueue = new Queue('stopMinecraft', queueConfig);
const commandQueue = new Queue('commandQueue', queueConfig);
const logQueue = new Queue('logQueue', queueConfig);

module.exports = function () {
    doQueue.process(5, provisioningWorker);
    ftpQueue.process(5, ftpWorker);
    mcQueue.process(5, minecraftWorker);
    pauseQueue.process(4, controlQueues.pauseWorker);
    stopQueue.process(4, controlQueues.stopWorker);
    commandQueue.process(5, controlQueues.commandWorker);
    logQueue.process(5, controlQueues.logWorker);
}

module.exports.queueConfig = queueConfig;