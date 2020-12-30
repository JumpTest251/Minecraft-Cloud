module.exports = {
    mongoUrl: process.env.MONGO_URL,
    userServiceUrl: "http://" + process.env.USER_SERVICE + ":" + process.env.USER_SERVICE_PORT,
    analyticsServiceUrl: process.env.ANALYTICS_SERVICE,
    redisUrl: process.env.REDIS_URL,
    doToken: process.env.DO_TOKEN,
    doKey: Buffer.from(process.env.DO_PRIVATE_KEY, 'base64').toString('ascii'),
    gcloudKey: process.env.GCLOUD_KEY,
    gcloudEmail: process.env.GCLOUD_EMAIL,
    gcloudProject: process.env.GCLOUD_PROJECT,
    backupImage: process.env.BACKUP_IMAGE || 'amueller2/cloudbackup:main',
    metricImage: process.env.METRIC_IMAGE || 'amueller2/cloudmetrics:latest'
}