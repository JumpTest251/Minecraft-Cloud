const express = require('express');
const app = express();

require('./database/setup')();
require('./utils/errorSetup')(app);
require('./provisioning/queueWorkers')();
require('./provisioning/backup/backupScheduler')();
require('./routes/routes').setupRoutes(app);

const port = process.env.PROVISIONING_SERVICE_PORT || 4000;
app.listen(port, () => {
    console.log("ServerProvisioning-Service Listening on " + port);
})