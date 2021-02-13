const Queue = require('bee-queue');
const config = require('../utils/config');
const digitaloceanProvider = require('./DigitaloceanProvider');
const Infrastructure = require('../models/Infrastructure');
const { fromInfrastructureId } = require('./docker/DockerUtil');
const { mcDomain } = require('./minecraft/minecraftConfig');

const queueConfig = {
    redis: {
        url: config.redisUrl
    }
}
const doQueue = new Queue('setupDroplet', queueConfig);
const mcQueue = new Queue('setupMinecraft', queueConfig);
const pauseQueue = new Queue('pauseMinecraft', queueConfig);
const stopQueue = new Queue('stopMinecraft', queueConfig);
const metricQueue = new Queue('metricQueue', queueConfig);

const ProvisioningService = function (serverTemplate) {
    this.serverTemplate = serverTemplate;
    this.time = new Date().getTime();
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
    if (this.serverTemplate.provider === 'digitalocean') {

        const createDroplet = doQueue.createJob({ serverTemplate: this.serverTemplate, hostname: this.hostname() });
        createDroplet
            .setId(`${this.hostname()}-${this.time}`)
            .save();

        createDroplet.on('progress', prog => console.log("job progress: " + prog))
        createDroplet.on('succeeded', function (data) {
            this.setupServer(data.infrastructure);
        }.bind(this))
    }
}

ProvisioningService.prototype.setupServer = async function (infrastructure) {
    console.log('starting on ' + infrastructure.name);
    await digitaloceanProvider.setupHostname(`${this.serverTemplate.name}.${this.serverTemplate.createdBy}`, infrastructure.ip);

    await this.createMetricCollector(this.serverTemplate, infrastructure);

    this.startServer(infrastructure._id);
}

ProvisioningService.prototype.startServer = function (infrastructure) {
    const createServer = mcQueue.createJob({ infrastructure: infrastructure, serverTemplate: this.serverTemplate });
    createServer.save();

    createServer.on('progress', prog => console.log("prog: " + prog))
    createServer.on('succeeded', prog => console.log("succ: " + prog))
}

ProvisioningService.prototype.stopServer = function (restart = false) {
    const stopServer = stopQueue.createJob({ serverTemplate: this.serverTemplate, restart })
    return stopServer.save();
}

ProvisioningService.prototype.createMetricCollector = function(serverTemplate, infrastructure) {
    const job = metricQueue.createJob({ serverTemplate, infrastructure: infrastructure._id })
    return job.save();
}

ProvisioningService.prototype.pause = async function () {
    const pauseServer = pauseQueue.createJob({ serverTemplate: this.serverTemplate });
    pauseServer.save();

    pauseServer.on('progress', prog => console.log("prog: " + prog))
    pauseServer.on('succeeded', prog => console.log("succ: " + prog))
}

ProvisioningService.prototype.cleanup = async function () {
    if (this.serverTemplate.provider !== 'custom' || this.serverTemplate.status === 'paused') {
        if (this.serverTemplate.status === 'paused') {
            if (this.serverTemplate.snapshot) await digitaloceanProvider.deleteSnapshot(this.serverTemplate.snapshot);
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

    if (this.serverTemplate.provider === 'digitalocean') {
        await digitaloceanProvider.removeDroplet(infrastructure.managedId);

    }

    return infrastructure
}

ProvisioningService.prototype.hostname = function () {
    const { name, createdBy } = this.serverTemplate;
    return name + "." + createdBy + "." + mcDomain;
}

module.exports = ProvisioningService;