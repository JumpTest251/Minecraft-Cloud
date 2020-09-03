const Infrastructure = require("../../models/Infrastructure");
const Docker = require('dockerode');
const dockerSshAgent = require('./dockerSshAgent');

const DockerUtil = function (infrastructure) {
    this.ip = infrastructure.ip;
    this.username = infrastructure.username;
    this.privateKey = infrastructure.privateKey;

    this.docker = new Docker({
        agent: dockerSshAgent({
            host: this.ip,
            port: 22,
            username: this.username,
            privateKey: this.privateKey
        }),
        protocol: 'http'
    })
}

DockerUtil.prototype.runContainer = async function (image, options) {
    const result = await this.docker.run(image, [], null, options);
    if (result) {
        console.log('output keys: ' +  Object.keys(result[0]))
  
        console.log('container keys: ' +  Object.keys(result[1]))
    
    }
    console.log('started.');

    return result;
}

DockerUtil.prototype.pullImage = async function (image) {
    const stream = await this.docker.pull(image)

    console.log('waiting for stream')
    await this.waitForFinish(stream);
}

DockerUtil.prototype.waitForFinish = function (stream) {
    return new Promise((resolve, reject) => {
        this.docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
    });
}



module.exports.DockerUtil = DockerUtil

module.exports.fromInfrastructureId = async function (id) {
    const infrastructure = await Infrastructure.findById(id);

    return new DockerUtil(infrastructure);
}