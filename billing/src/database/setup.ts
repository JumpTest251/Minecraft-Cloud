import mongoose from 'mongoose';
import config from '../utils/config';

import { natsClient, utils } from '@jumper251/core-module'

const connectMongoose = async () => {
    try {
        await mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB")
    } catch (err) {
        console.error("Error whilst connecting to MongoDB: " + err.message)
    }
}

const setupNats = async () => {
    try {
        const clientId = await utils.randomString(8);

        await natsClient.connect(config.natsCluster, clientId, { url: config.natsUrl })
        console.log("Connected to NATS")

        natsClient.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });

        process.on('SIGINT', () => natsClient.client.close());
        process.on('SIGTERM', () => natsClient.client.close());
    } catch (err) {
        console.error("Error whilst connecting to NATS: " + err.message)
    }
}

export default () => {
    return Promise.all([connectMongoose(), setupNats()]);
};