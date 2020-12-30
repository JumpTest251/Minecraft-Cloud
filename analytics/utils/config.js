module.exports = {
    mongoUrl: process.env.MONGO_URL,
    serverServiceUrl: (process.env.NODE_ENV === 'production' ? "https://" : "http://") + process.env.SERVER_SERVICE + ":" + process.env.SERVER_SERVICE_PORT,
    redisUrl: process.env.REDIS_URL,
    influxToken: process.env.INFLUX_TOKEN,
    influxOrg: process.env.INFLUX_ORG,
    reportingRate: 30,
    pauseAfter: 600
}