module.exports = {
    mongoUrl: process.env.MONGO_URL,
    userServiceUrl: "http://" + process.env.USER_SERVICE + ":" + process.env.USER_SERVICE_PORT,
    redisUrl: process.env.REDIS_URL,
    doToken: process.env.DO_TOKEN,
    doKey: Buffer.from(process.env.DO_PRIVATE_KEY, 'base64').toString('ascii')
}