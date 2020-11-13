const { fromInfrastructureId } = require("../docker/DockerUtil");
const ServerTemplate = require('../../models/ServerTemplate');
const { gcloudEmail, gcloudProject, gcloudKey, backupImage } = require('../../utils/config');
const { bucketName } = require('../gcloud')

module.exports.create = async function (job) {
    const { serverTemplate } = job.data;

    const freshServer = await ServerTemplate.findOne({ _id: serverTemplate._id })
    if (!freshServer.isAvailable()) throw "Server not ready";

    const dockerOptions = getDockerOptions('backup', serverTemplate.createdBy, serverTemplate.name)

    const res = await runContainer(serverTemplate.infrastructure, dockerOptions)
    if (res && res[0].StatusCode !== 0) {
        throw "Backup failed with status code " + res[0].StatusCode;
    } else {
        await ServerTemplate.updateOne({ _id: serverTemplate._id }, { 'backup.last': Date.now() })
    }


    return true;
}

module.exports.restore = async function (job) {
    const { serverTemplate, generation } = job.data;
    const docker = await fromInfrastructureId(serverTemplate.infrastructure);

    job.reportProgress(10);
    await docker.removeContainer(serverTemplate.name, true);
    job.reportProgress(20);

    const dockerOptions = getDockerOptions('restore', serverTemplate.createdBy, serverTemplate.name, { generation })

    const res = await runContainer(serverTemplate.infrastructure, dockerOptions, docker)
    job.reportProgress(60);
    await ServerTemplate.updateStatus(serverTemplate, 'stopped');
    job.reportProgress(80);

    if (res && res[0].StatusCode !== 0) throw "Restore failed with status code " + res[0].StatusCode;

    return true;
}


function getDockerOptions(action, username, serverName, optional) {
    const maxSize = optional && optional.maxSize || 5000
    const generation = optional && optional.generation || 1

    return {
        Env: [
            `GCLOUD_EMAIL=${gcloudEmail}`,
            `GCLOUD_KEY=${gcloudKey}`,
            `PROJECT_ID=${gcloudProject}`,
            `BUCKET_NAME=${bucketName}`,
            `ACTION=${action}`,
            `USERNAME=${username}`,
            `SERVER_NAME=${serverName}`,
            `GENERATION=${generation}`,
            `MAX_SIZE=${maxSize}`
        ],
        Binds: [`/home/mccloud:/home/mccloud`]
    }
}

async function runContainer(infrastructure, options, dockerUtil) {
    const docker = dockerUtil || await fromInfrastructureId(infrastructure);

    await docker.pullImage(backupImage);

    return docker.runContainer(backupImage, options);
}