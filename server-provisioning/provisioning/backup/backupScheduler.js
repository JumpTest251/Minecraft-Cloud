const cron = require('node-cron');
const ServerTemplate = require('../../models/ServerTemplate');

module.exports = function () {
    cron.schedule('0 1 * * *', queueBackups)
    cron.schedule('0 13 * * *', queueBackups)
}

async function queueBackups() {
    const date = new Date().toDateString();
    const servers = await ServerTemplate.find({ 'backup.enabled': true, status: ['started', 'stopped'], templateType: 'static' });

    servers.forEach(server => {
        console.log(`Scheduling backup for ${server.createdBy}/${server.name}`)
        server.Backup().create(`${date}-${server._id}`)
    })
}

