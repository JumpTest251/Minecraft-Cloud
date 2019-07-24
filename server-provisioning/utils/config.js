module.exports = {
    mongoUrl: process.env.MONGO_URL,
    userServiceUrl: "http://" + process.env.USER_SERVICE + ":" + process.env.USER_SERVICE_PORT
}