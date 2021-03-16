const ProvisioningService = require("../ProvisioningService");

module.exports = function ({ serverQueue }) {
    serverQueue.on('succeeded', (job, result) => {
        console.log(`Provisioning succeeded: ${job.id}`);

        new ProvisioningService(job.data.serverTemplate).setupServer(result.infrastructure)
    })
}