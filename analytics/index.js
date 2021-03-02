const express = require('express');
const app = express();

require('./database/setup')();
require('./utils/errorSetup')(app);
require('./routes/routes').setupRoutes(app);

const port = process.env.ANALYTICS_SERVICE_PORT || 5000;
app.listen(port, () => {
    console.log("Analytics-Service Listening on " + port);
})