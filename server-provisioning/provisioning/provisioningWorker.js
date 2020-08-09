const config = require('../utils/config');
const digitaloceanProvider = require('./DigitaloceanProvider');
const Infrastructure = require('../models/Infrastructure');
const ServerTemplate = require('../models/ServerTemplate');

const Queue = require('bee-queue');
const { doKey } = require('../utils/config');

const doQueue = new Queue('setupDroplet', {
    redis: {
        url: config.redisUrl
    }
});


module.exports = function () {
    doQueue.process(5, async job => {
        job.reportProgress(10)

        let droplet = await digitaloceanProvider.requestDroplet(job.data.serverTemplate, job.id);
        job.reportProgress(20);
        droplet = await testDroplet(droplet.id, job.id);
        job.reportProgress(50);

        const infrastructure = new Infrastructure({
            name: `droplet-${droplet.id}`,
            owner: job.data.serverTemplate.createdBy,
            ip: droplet.networks.v4[0].ip_address,
            username: 'root',
            privateKey: doKey,
            managedId: droplet.id
        })

        await infrastructure.save();
        job.reportProgress(80);

        const template = await ServerTemplate.findById(job.data.serverTemplate._id);
        template.infrastructure = infrastructure._id;
        await template.save();
        job.reportProgress(90);


        return { dropletId: droplet.id, infrastructure: infrastructure }
    })
}

function testDroplet(id, jobId) {
    return new Promise(resolve => {

        let timer = setInterval(async () => {
            const droplet = await digitaloceanProvider.getDroplet(id);

            const job = await doQueue.getJob(jobId);
            console.log("droplet status: " + droplet.status + " job status: " + job.status);

            if (droplet.status !== 'new' || job.status !== 'created') {
                clearInterval(timer);
                resolve(droplet);
            }

        }, 1000 * 5);

    })
}
