const { fromProvider, ServerProvider } = require('../providers/ServerProvider');

const Infrastructure = require('../../models/Infrastructure');
const ServerTemplate = require('../../models/ServerTemplate');
const Queue = require('bee-queue');
const QueueType = require('../queues');

const { doKey, redisUrl } = require('../../utils/config');

const queueConfig = {
    redis: {
        url: redisUrl
    },
    isWorker: false,
    getEvents: false
}

const ftpQueue = new Queue(QueueType.SetupFtp, queueConfig);

module.exports = async function (job) {
    const serverProvider = fromProvider(job.data.serverTemplate.provider);
    let droplet;

    job.reportProgress(10)

    if (!job.data.droplet) {
        droplet = await serverProvider.requestNewServer(job.data.serverTemplate, job.data.hostname);
        job.data.droplet = { id: droplet.id }
        updateJob(job.queue, job.id, job.toData());
    }

    job.reportProgress(20);
    if (!job.data.droplet || !job.data.droplet.ip) {
        droplet = await testDroplet(job.data.droplet.id, job.id, job.queue, serverProvider);
        job.data.droplet.ip = droplet.ip;
        updateJob(job.queue, job.id, job.toData());
    }


    job.reportProgress(50);

    let infrastructure = new Infrastructure({
        name: `server-${job.data.droplet.id}`,
        owner: job.data.serverTemplate.createdBy,
        ip: job.data.droplet.ip,
        username: 'root',
        privateKey: doKey,
        managedId: job.data.droplet.id
    })

    if (!job.data.infrastructure) {
        await infrastructure.save();
        job.data.infrastructure = infrastructure._id;
        updateJob(job.queue, job.id, job.toData());
    } else {
        infrastructure = await Infrastructure.findById(job.data.infrastructure);
    }

    job.reportProgress(80);

    const template = await ServerTemplate.findById(job.data.serverTemplate._id);
    if (template.snapshot) {
        await serverProvider.deleteSnapshot(template.snapshot);
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

function updateJob(queue, jobId, jobData) {
    return queue.client.hset(queue.toKey('jobs'), jobId, jobData);
}

function testDroplet(id, jobId, queue, serverProvider) {
    return new Promise(resolve => {

        let timer = setInterval(async () => {
            const droplet = await serverProvider.getServer(id);

            const job = await queue.getJob(jobId);
            console.log("droplet status: " + droplet.status + " job status: " + job.status);

            if (ServerProvider.isCreated(droplet) || job.status !== 'created') {
                clearInterval(timer);
                resolve(droplet);
            }

        }, 1000 * 5);

    })
}
