const axios = require('axios');
const { tokenGenerator } = require('@jumper251/core-module');
const config = require('./config');

const serviceToken = tokenGenerator.generateServiceToken();

const authHeader = {
    headers: {
        Authorization: serviceToken
    }
}

module.exports.createAnalytics = function (serverId) {
    return axios.post(`${config.analyticsServiceUrl}/server`, {
        server: serverId
    }, authHeader)
}

module.exports.retrieveAnalytics = function (server) {
    return axios.get(`${config.analyticsServiceUrl}/server/${server.createdBy}/${server.name}`, authHeader);
}

module.exports.deleteAnalytics = function (serverId) {
    return axios.delete(`${config.analyticsServiceUrl}/server/${serverId}`, authHeader);
}
