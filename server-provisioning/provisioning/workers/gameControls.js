const { fromInfrastructureId } = require("../docker/DockerUtil");
const digitaloceanProvider = require("../providers/DigitaloceanProvider");
const { fromProvider } = require('../providers/ServerProvider');
const Infrastructure = require("../../models/Infrastructure");
const ServerTemplate = require("../../models/ServerTemplate");
const ProvisioningService = require("../ProvisioningService");
const { caching: { CachedSet } } = require('@jumper251/core-module');

module.exports.pauseWorker = async function (job) {
    const { serverTemplate } = job.data;

    if (!job.data.actionId) {
        const docker = await fromInfrastructureId(serverTemplate.infrastructure)

        await docker.stopContainer(serverTemplate.name, 15);
        await docker.removeContainer(serverTemplate.name, true);
        await docker.removeContainer(`metrics_${serverTemplate._id}`, true, true);
    }

    job.reportProgress(20);

    const serverUpdate = {
        status: 'paused',
        infrastructure: null
    }

    if (serverTemplate.templateType === 'static') {
        const serverProvider = fromProvider(serverTemplate.provider);

        await new Promise(resolve => setTimeout(resolve, 5000))

        const infrastructure = await Infrastructure.findById(serverTemplate.infrastructure);

        if (!job.data.actionId) {
            const { id: actionId, snapshotId } = await serverProvider.createSnapshot(infrastructure.managedId, serverTemplate._id);
            job.data.actionId = actionId;
            job.data.snapshotId = snapshotId;
            updateJob(job.queue, job.id, job.toData());
        }

        console.log(job.data.actionId);
        job.reportProgress(30);
        await waitForAction(infrastructure.managedId, job.data.actionId, job.id, job.queue, serverProvider);
        job.reportProgress(80);

        if (!job.data.snapshotId) {
            const snapshots = await digitaloceanProvider.getSnapshots(infrastructure.managedId);
            const snapshot = snapshots.find(el => el.name === serverTemplate._id);

            console.log(snapshot.id);
            serverUpdate.snapshot = snapshot.id;
        } else {
            console.log(job.data.snapshotId);
            serverUpdate.snapshot = job.data.snapshotId;
        }

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

    const stream = await docker.attachAndExec(serverTemplate.name, command);
    const data = await docker.waitForStream(stream);
    stream.end();

    if (!data) return '';

    return data.toString('utf8').trim();
}

module.exports.logWorker = async function (job) {
    const { serverTemplate } = job.data;

    const docker = await fromInfrastructureId(serverTemplate.infrastructure);

    const logs = await docker.getLogs(serverTemplate.name, 300);

    return logs ? logs.toString('utf-8') : logs;
}

function updateJob(queue, jobId, jobData) {
    return queue.client.hset(queue.toKey('jobs'), jobId, jobData);
}

function waitForAction(id, actionId, jobId, queue, serverProvider) {
    return new Promise(resolve => {

        let timer = setInterval(async () => {
            const action = await serverProvider.getAction(id, actionId);

            const job = await queue.getJob(jobId);
            console.log("action status: " + action.status + " job status: " + job.status);

            if ((action.status !== 'in-progress' && action.status !== 'running') || job.status !== 'created') {
                clearInterval(timer);
                resolve(action);
            }

        }, 1000 * 15);

    })
}