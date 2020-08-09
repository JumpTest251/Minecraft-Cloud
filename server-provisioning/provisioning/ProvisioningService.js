const Queue = require('bee-queue');
const config = require('../utils/config');
const digitaloceanProvider = require('./DigitaloceanProvider');
const { DockerUtil, fromInfrastructureId } = require('./docker/DockerUtil');

const queueConfig = {
    redis: {
        url: config.redisUrl
    }
}
const doQueue = new Queue('setupDroplet', queueConfig);

const ProvisioningService = function (serverTemplate) {
    this.serverTemplate = serverTemplate;
    this.time = new Date().getMilliseconds();
}

ProvisioningService.prototype.create = async function () {
    if (this.serverTemplate.provider !== 'custom') {
        this.setupInfrastructure();
    }


    return this.time;
}

ProvisioningService.prototype.setupInfrastructure = async function () {
    if (this.serverTemplate.provider === 'digitalocean') {

        const createDroplet = doQueue.createJob({ serverTemplate: this.serverTemplate });
        createDroplet
            .setId(this.hostname())
            .save();

        createDroplet.on('progress', prog => console.log("job progress: " + prog))
        createDroplet.on('succeeded', function (data) {
            this.startServer(data);
        }.bind(this))
    }
}

ProvisioningService.prototype.startServer = async function (data) {
    const { dropletId, infrastructure } = data;
    console.log('starting on ' + dropletId);

    setTimeout(async function () {
        const droppi = await digitaloceanProvider.getDroplet(dropletId);
        await digitaloceanProvider.setupHostname(`${this.serverTemplate.name}.${this.serverTemplate.createdBy}`, droppi.networks.v4[0].ip_address);

        const docker = await fromInfrastructureId(infrastructure._id);
        await docker.runContainer('ubuntu:latest', {});
    }.bind(this), 1 * 1000);

}


ProvisioningService.prototype.hostname = function () {
    const { name, createdBy } = this.serverTemplate;
    return name + "." + createdBy + ".mcservers.me";
}

module.exports = ProvisioningService;