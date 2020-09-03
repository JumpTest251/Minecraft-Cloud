const config = require('../utils/config');

const Queue = require('bee-queue');
const provisioningWorker = require('./provisioningWorker');
const minecraftWorker = require('./minecraft/minecraftWorker');

const queueConfig = {
    redis: {
        url: config.redisUrl
    }
}
const doQueue = new Queue('setupDroplet', queueConfig);
const mcQueue = new Queue('setupMinecraft', queueConfig);


module.exports = function() {
    doQueue.process(5, provisioningWorker);
    mcQueue.process(5, minecraftWorker);

}