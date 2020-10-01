const digitaloceanProvider = require('./DigitaloceanProvider');
const Infrastructure = require('../models/Infrastructure');
const ServerTemplate = require('../models/ServerTemplate');
const Queue = require('bee-queue');
const { doKey, redisUrl } = require('../utils/config');

const queueConfig = {
    redis: {
        url: redisUrl
    }
}

const ftpQueue = new Queue('ftpQueue', queueConfig);

module.exports = async function (job) {
    job.reportProgress(10)

    let droplet = await digitaloceanProvider.requestDroplet(job.data.serverTemplate, job.data.hostname);
    job.reportProgress(20);
    droplet = await testDroplet(droplet.id, job.id, job.queue);
    job.reportProgress(50);

    const infrastructure = new Infrastructure({
        name: `droplet-${droplet.id}`,
        owner: job.data.serverTemplate.createdBy,
        ip: droplet.networks.v4[1].ip_address,
        username: 'root',
        privateKey: doKey,
        managedId: droplet.id
    })

    await infrastructure.save();
    job.reportProgress(80);

    const template = await ServerTemplate.findById(job.data.serverTemplate._id);
    if (template.snapshot) {
        await digitaloceanProvider.deleteSnapshot(template.snapshot);
        template.snapshot = null;
    }

    template.infrastructure = infrastructure._id;
    await template.save();
    job.reportProgress(90);

    if (template.templateType === 'static') await createSftpJob(template, infrastructure);

    return { dropletId: droplet.id, infrastructure: infrastructure }

}

function createSftpJob(serverTemplate, infrastructure) {
    const job = ftpQueue.createJob({ serverTemplate, infrastructure: infrastructure._id })
    return job.save();
}

function testDroplet(id, jobId, queue) {
    return new Promise(resolve => {

        let timer = setInterval(async () => {
            const droplet = await digitaloceanProvider.getDroplet(id);

            const job = await queue.getJob(jobId);
            console.log("droplet status: " + droplet.status + " job status: " + job.status);

            if (droplet.status !== 'new' || job.status !== 'created') {
                clearInterval(timer);
                resolve(droplet);
            }

        }, 1000 * 5);

    })
}
