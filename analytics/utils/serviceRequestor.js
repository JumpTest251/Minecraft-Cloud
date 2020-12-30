const axios = require('axios');
const { tokenGenerator } = require('@jumper251/core-module');
const config = require('./config');

const serviceToken = tokenGenerator.generateServiceToken();

const authHeader = {
    headers: {
        Authorization: serviceToken
    }
}

module.exports.requestServerDetails = function (serverId) {
    return axios.get(`${config.serverServiceUrl}/servers/${serverId}/id`, authHeader);
}

module.exports.requestServerPause = function (server) {
    return axios.post(`${config.serverServiceUrl}/servers/${server.createdBy}/${server.name}/action`, {
        type: 'pause'
    }, authHeader);
}

