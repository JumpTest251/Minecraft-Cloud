const config = require('../utils/config');

const Queue = require('bee-queue');
const provisioningWorker = require('./provisioningWorker');
const ftpWorker = require('./ftpWorker');
const minecraftWorker = require('./minecraft/minecraftWorker');
const controlQueues = require('./minecraft/minecraftControls');
const backupWorker = require('./minecraft/backupWorker');

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
const backupQueue = new Queue('backupQueue', queueConfig);
const restoreQueue = new Queue('restoreQueue', queueConfig);

module.exports = function () {
    // Provisioning Queue
    doQueue.process(5, provisioningWorker);

    // SFTP Server setup Queue
    ftpQueue.process(5, ftpWorker);

    // Minecraft Server setup Queue
    mcQueue.process(5, minecraftWorker);

    // Minecraft Server control Queue
    pauseQueue.process(4, controlQueues.pauseWorker);
    stopQueue.process(4, controlQueues.stopWorker);
    commandQueue.process(5, controlQueues.commandWorker);
    logQueue.process(5, controlQueues.logWorker);

    // Backup Queue
    backupQueue.process(5, backupWorker.create);
    restoreQueue.process(5, backupWorker.restore);

}

module.exports.queueConfig = queueConfig;
