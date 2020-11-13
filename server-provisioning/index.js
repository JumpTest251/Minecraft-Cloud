const express = require('express');
const app = express();

require('./database/setup')();
require('./provisioning/queueWorkers')();
require('./provisioning/minecraft/backupScheduler')();
require('./routes/routes').setupRoutes(app);

const port = process.env.PROVISIONING_SERVICE_PORT || 4000;
app.listen(port, () => {
    console.log("ServerProvisioning-Service Listening on " + port);
})