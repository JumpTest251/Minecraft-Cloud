const Queue = require('bee-queue');
const config = require('../utils/config');
const QueueType = require('./queues');
const digitaloceanProvider = require('./providers/DigitaloceanProvider');
const { fromProvider } = require('./providers/ServerProvider');
const Infrastructure = require('../models/Infrastructure');
const { fromInfrastructureId } = require('./docker/DockerUtil');
const { mcDomain } = require('./minecraft/minecraftConfig');

// Use redis.createClient({url: config.redisUrl}) to reduce connections
const queueConfig = {
    redis: {
        url: config.redisUrl
    },
    isWorker: false,
    getEvents: false
}

const serverQueue = new Queue(QueueType.SetupServer, queueConfig);
const gameQueue = new Queue(QueueType.SetupGame, queueConfig);
const pauseQueue = new Queue(QueueType.PauseGame, queueConfig);
const stopQueue = new Queue(QueueType.StopGame, queueConfig);
const metricQueue = new Queue(QueueType.SetupMetric, queueConfig);

const ProvisioningService = function (serverTemplate) {
    this.serverTemplate = serverTemplate;
    this.time = new Date().getTime();
    this.serverProvider = fromProvider(serverTemplate.provider);
}

ProvisioningService.prototype.create = async function () {
    if (this.serverTemplate.provider !== 'custom') {
        this.setupInfrastructure();
    } else {
        const customInfra = await Infrastructure.findById(this.serverTemplate.infrastructure);
        this.setupServer(customInfra)
    }


    return this.time;
}

ProvisioningService.prototype.setupInfrastructure = async function () {
    if (this.serverTemplate.provider === 'digitalocean' || this.serverTemplate.provider === 'hetzner') {

        const createDroplet = serverQueue.createJob({ serverTemplate: this.serverTemplate, hostname: this.hostname() });
        createDroplet
            .setId(`${this.hostname()}-${this.time}`)
            .retries(5)
            .backoff('exponential', 600)
            .save();
    }
}

ProvisioningService.prototype.setupServer = async function (infrastructure) {
    console.log('starting on ' + infrastructure.name);
    await digitaloceanProvider.setupHostname(`${this.serverTemplate.name}.${this.serverTemplate.createdBy}`, infrastructure.ip);

    await this.createMetricCollector(this.serverTemplate, infrastructure);

    this.startServer(infrastructure._id);
}

ProvisioningService.prototype.startServer = function (infrastructure) {
    const createServer = gameQueue.createJob({ infrastructure: infrastructure, serverTemplate: this.serverTemplate });
    createServer.save();
}

ProvisioningService.prototype.stopServer = function (restart = false) {
    const stopServer = stopQueue.createJob({ serverTemplate: this.serverTemplate, restart }).retries(2)
    return stopServer.save();
}

ProvisioningService.prototype.createMetricCollector = function (serverTemplate, infrastructure) {
    const job = metricQueue.createJob({ serverTemplate, infrastructure: infrastructure._id })
    return job.save();
}

ProvisioningService.prototype.pause = async function () {
    const pauseServer = pauseQueue.createJob({ serverTemplate: this.serverTemplate });
    return pauseServer
        .retries(4)
        .save();
}

ProvisioningService.prototype.cleanup = async function () {
    if (this.serverTemplate.provider !== 'custom' || this.serverTemplate.status === 'paused') {
        if (this.serverTemplate.status === 'paused') {
            if (this.serverTemplate.snapshot) await this.serverProvider.deleteSnapshot(this.serverTemplate.snapshot);
        } else {
            await this.removeInfrastructure();
        }
    } else {
        const docker = await fromInfrastructureId(this.serverTemplate.infrastructure)
        docker.removeContainer(this.serverTemplate.name, true, true);
        docker.removeContainer(`metrics_${this.serverTemplate._id}`, true, true);
    }

    await digitaloceanProvider.removeHostname(this.hostname());
}

ProvisioningService.prototype.removeInfrastructure = async function () {
    const infrastructure = await Infrastructure.findByIdAndDelete(this.serverTemplate.infrastructure);

    if (this.serverTemplate.provider === 'digitalocean' || this.serverTemplate.provider === 'hetzner') {
        await this.serverProvider.removeServer(infrastructure.managedId);

    }

    return infrastructure
}

ProvisioningService.prototype.hostname = function () {
    const { name, createdBy } = this.serverTemplate;
    return name + "." + createdBy + "." + mcDomain;
}

module.exports = ProvisioningService;