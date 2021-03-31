export default {
    mongoUrl: process.env.MONGO_URL!,
    userServiceUrl: process.env.USER_SERVICE!,
    redisUrl: process.env.REDIS_URL!,
    natsCluster: process.env.NATS_CLUSTER!,
    natsUrl: process.env.NATS_URL!,
    paypalClientId: process.env.PAYPAL_CLIENT_ID!,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET!,
    queueGroupName: 'billing'

}