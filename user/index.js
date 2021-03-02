const express = require('express');
const app = express();

require('./database/setup')();
require('./utils/errorSetup')(app);
require('./routes/routes').setupRoutes(app);

const port = process.env.USER_SERVICE_PORT || 3000;
app.listen(port, () => {
    console.log("User-Service Listening on " + port);
})