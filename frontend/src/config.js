export default {
    userServiceUrl: process.env.VUE_APP_USER_SERVICE || 'http://localhost:3000',
    serverServiceUrl: process.env.VUE_APP_PROVISIONING_SERVICE || 'http://localhost:4000',
    analyticsServiceUrl: process.env.VUE_APP_ANALYTICS_SERVICE || 'http://localhost:5000',

}