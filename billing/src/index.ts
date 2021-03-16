import { app } from './app';
import setupDatabase from './database/setup';

const start = async () => {
    await setupDatabase();
    require('./utils/errorSetup')(app);


    const port = process.env.BILLING_SERVICE_PORT || 6000;
    app.listen(port, () => {
        console.log("Billing-Service Listening on " + port);
    })
}

start();