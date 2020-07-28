const express = require('express');
const app = express();

require('./database/setup')();
require('./routes/routes').setupRoutes(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("User-Service Listening on " + port);
})