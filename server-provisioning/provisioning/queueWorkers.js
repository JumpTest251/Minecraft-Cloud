const config = require('../utils/config');
const QueueType = require('./queues');
const setupProvisioningListener = require('./workers/provisioningListener');

const Queue = require('bee-queue');
const provisioningWorker = require('./workers/provisioningWorker');
const ftpWorker = require('./workers/ftpWorker');
const metricWorker = require('./workers/metricWorker');

const gameserverWorker = require('./workers/gameserverWorker');
const controlQueues = require('./workers/gameControls');
const backupWorker = require('./workers/backupWorker');

const queueConfig = {
    redis: {
        url: config.redisUrl
    }
}
const serverQueue = new Queue(QueueType.SetupServer, queueConfig);
const ftpQueue = new Queue(QueueType.SetupFtp, queueConfig);
const metricQueue = new Queue(QueueType.SetupMetric, queueConfig);

const gameserverQueue = new Queue(QueueType.SetupGame, queueConfig);
const pauseQueue = new Queue(QueueType.PauseGame, queueConfig);
const stopQueue = new Queue(QueueType.StopGame, queueConfig);
const commandQueue = new Queue(QueueType.CommandQueue, queueConfig);
const logQueue = new Queue(QueueType.LogQueue, queueConfig);
const backupQueue = new Queue(QueueType.BackupQueue, queueConfig);
const restoreQueue = new Queue(QueueType.RestoreQueue, queueConfig);

const queues = [serverQueue, ftpQueue, metricQueue, gameserverQueue, pauseQueue, stopQueue, commandQueue, logQueue, backupQueue, restoreQueue];

const workers = {
    serverQueue,
    ftpQueue,
    metricQueue,
    gameserverQueue,
    pauseQueue,
    stopQueue,
    commandQueue,
    logQueue,
    backupQueue,
    restoreQueue
}

module.exports = function () {
    // Provisioning Queue
    serverQueue.process(10, provisioningWorker);

    // SFTP Server setup Queue
    ftpQueue.process(10, ftpWorker);

    // Metric collection setup Queue
    metricQueue.process(10, metricWorker);

    // Minecraft Server setup Queue
    gameserverQueue.process(10, gameserverWorker);

    // Minecraft Server control Queue
    pauseQueue.process(5, controlQueues.pauseWorker);
    stopQueue.process(20, controlQueues.stopWorker);
    commandQueue.process(20, controlQueues.commandWorker);
    logQueue.process(20, controlQueues.logWorker);

    // Backup Queue
    backupQueue.process(5, backupWorker.create);
    restoreQueue.process(5, backupWorker.restore);

    setupProvisioningListener(workers);

    queues.forEach(queue => {
        queue.checkStalledJobs();
    })
}

module.exports.queueConfig = queueConfig;
module.exports.queues = queues;
module.exports.workers = workers;
