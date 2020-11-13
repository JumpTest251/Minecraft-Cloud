const { fromInfrastructureId } = require("../docker/DockerUtil");
const digitaloceanProvider = require("../DigitaloceanProvider");
const Infrastructure = require("../../models/Infrastructure");
const ServerTemplate = require("../../models/ServerTemplate");
const ProvisioningService = require("../ProvisioningService");
const { CachedSet } = require('../../utils/cache');

module.exports.pauseWorker = async function (job) {
    const { serverTemplate } = job.data;

    const docker = await fromInfrastructureId(serverTemplate.infrastructure)

    await docker.stopContainer(serverTemplate.name, 15);
    await docker.removeContainer(serverTemplate.name, true);
    await docker.waitForContainer(serverTemplate.name, 1000, data => !data)

    job.reportProgress(20);

    const serverUpdate = {
        status: 'paused',
        infrastructure: null
    }

    if (serverTemplate.templateType === 'static') {
        await new Promise(resolve => setTimeout(resolve, 5000))

        const infrastructure = await Infrastructure.findById(serverTemplate.infrastructure);

        const action = await digitaloceanProvider.createSnapshot(infrastructure.managedId, serverTemplate._id);
        console.log(action.id);
        job.reportProgress(30);
        await waitForAction(infrastructure.managedId, action.id, job.id, job.queue);
        job.reportProgress(80);

        const snapshots = await digitaloceanProvider.getSnapshots(infrastructure.managedId);
        const snapshot = snapshots.find(el => el.name === serverTemplate._id);

        console.log(snapshot.id);
        serverUpdate.snapshot = snapshot.id;
    }

    await ServerTemplate.findOneAndUpdate({ _id: serverTemplate._id }, serverUpdate);

    const service = new ProvisioningService(serverTemplate);
    await service.cleanup();

    return true;
}

module.exports.stopWorker = async function (job) {
    const { serverTemplate, restart } = job.data;
    const docker = await fromInfrastructureId(serverTemplate.infrastructure)
    const recent = new CachedSet('recentlyUpdated');

    if (restart) {
        await docker.restartContainer(serverTemplate.name, 15);

        await ServerTemplate.findOneAndUpdate({ _id: serverTemplate._id }, { status: 'started' });
    } else {
        await docker.stopContainer(serverTemplate.name, 15);

        const updated = await recent.contains(serverTemplate._id.toString());

        if (serverTemplate.provider === 'custom' || serverTemplate.templateType === 'dynamic' || updated) {
            await docker.removeContainer(serverTemplate.name, true);

            if (updated) recent.remove(serverTemplate._id.toString())
        }
    }
}

module.exports.commandWorker = async function (job) {
    const { serverTemplate, command } = job.data;
    const docker = await fromInfrastructureId(serverTemplate.infrastructure);

    const stream = await docker.execCommand(serverTemplate.name, command);
    const data = await docker.waitForStream(stream);

    if (!data) return '';

    return data.toString('utf8').trim();
}

module.exports.logWorker = async function (job) {
    const { serverTemplate } = job.data;

    const docker = await fromInfrastructureId(serverTemplate.infrastructure);

    const logs = await docker.getLogs(serverTemplate.name, 300);

    return logs ? logs.toString('utf-8') : logs;
}



function waitForAction(id, actionId, jobId, queue) {
    return new Promise(resolve => {

        let timer = setInterval(async () => {
            const action = await digitaloceanProvider.getAction(id, actionId);

            const job = await queue.getJob(jobId);
            console.log("action status: " + action.status + " job status: " + job.status);

            if (action.status !== 'in-progress' || job.status !== 'created') {
                clearInterval(timer);
                resolve(action);
            }

        }, 1000 * 15);

    })
}