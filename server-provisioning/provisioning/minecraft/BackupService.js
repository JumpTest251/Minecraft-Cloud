const Queue = require('bee-queue');
const { redisUrl } = require('../../utils/config');
const { deleteFiles, buildPrefix } = require('../gcloud');

const queueConfig = {
    redis: {
        url: redisUrl
    }
}
const backupQueue = new Queue('backupQueue', queueConfig);
const restoreQueue = new Queue('restoreQueue', queueConfig);

class BackupService {
    constructor(serverTemplate) {
        this.serverTemplate = serverTemplate;
    }
    create(id) {
        const backupJob = backupQueue.createJob({ serverTemplate: this.serverTemplate });
        if (id) backupJob.setId(id);

        return backupJob.save();
    }
    restore(generation) {
        const backupJob = restoreQueue.createJob({ serverTemplate: this.serverTemplate, generation });
        return backupJob.save();
    }
    cleanup() {
        const valid = (Date.now() - 8 * 24 * 60 * 60 * 1000);
        if (this.serverTemplate.backup && this.serverTemplate.backup.last && this.serverTemplate.backup.last > valid) {
            return deleteFiles(buildPrefix(this.serverTemplate), true)
        }
    }
}



module.exports = BackupService;