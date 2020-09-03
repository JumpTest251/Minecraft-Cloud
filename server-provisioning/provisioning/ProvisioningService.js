const Queue = require('bee-queue');
const config = require('../utils/config');
const digitaloceanProvider = require('./DigitaloceanProvider');

const queueConfig = {
    redis: {
        url: config.redisUrl
    }
}
const doQueue = new Queue('setupDroplet', queueConfig);
const mcQueue = new Queue('setupMinecraft', queueConfig);

const ProvisioningService = function (serverTemplate) {
    this.serverTemplate = serverTemplate;
    this.time = new Date().getMilliseconds();
}

ProvisioningService.prototype.create = async function () {
    if (this.serverTemplate.provider !== 'custom') {
        this.setupInfrastructure();
    } else {
        
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
    const { infrastructure } = data;
    console.log('starting on ' + infrastructure.name);
    await digitaloceanProvider.setupHostname(`${this.serverTemplate.name}.${this.serverTemplate.createdBy}`, infrastructure.ip);

    const createServer = mcQueue.createJob({ infrastructure: infrastructure._id, serverTemplate: this.serverTemplate });
    createServer.save();

    createServer.on('progress', prog => console.log("prog: " + prog))
    createServer.on('succeeded', prog => console.log("succ: " + prog))


}


ProvisioningService.prototype.hostname = function () {
    const { name, createdBy } = this.serverTemplate;
    return name + "." + createdBy + ".mcservers.me";
}

module.exports = ProvisioningService;