import { app } from './app';
import setupDatabase from './database/setup';
import errorSetup from './utils/errorSetup';
import { setupListeners } from './subscribers/listeners';

const start = async () => {
    await setupDatabase();
    errorSetup(app);

    setupListeners();

    const port = process.env.BILLING_SERVICE_PORT || 7000;
    app.listen(port, () => {
        console.log("Billing-Service Listening on " + port);
    })
}

start();