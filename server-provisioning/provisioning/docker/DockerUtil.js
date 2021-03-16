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
        console.log('output keys: ' + Object.keys(result[0]))

        console.log('container keys: ' + Object.keys(result[1]))

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

DockerUtil.prototype.removeContainer = async function (name, force = false, v = false) {
    const container = this.docker.getContainer(name);

    try {
        return await container.remove({ force: force, v: v })
    } catch (ex) {
        console.log('error removing ' + name);
    }
}

DockerUtil.prototype.inspectContainer = async function (name) {
    const container = this.docker.getContainer(name);

    try {
        return await container.inspect();
    } catch (ex) {
        console.log('error inspecting ' + ex);
    }
}

DockerUtil.prototype.stopContainer = async function (name, timeToKill) {
    const container = this.docker.getContainer(name);

    try {
        return await container.stop({ t: timeToKill });
    } catch (ex) {
        console.log('error stopping ' + name);
    }
}

DockerUtil.prototype.startContainer = function (name) {
    const container = this.docker.getContainer(name);
    return container.start();
}

DockerUtil.prototype.getLogs = async function (name, tail = 100) {
    const container = this.docker.getContainer(name);
    try {
        return await container.logs({ tail, stderr: true, stdout: true })
    } catch (ex) {

    }
}

DockerUtil.prototype.attachAndExec = async function (name, command) {
    const container = this.docker.getContainer(name);
    const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
    });
    
    stream.setEncoding('utf8');
    stream.write(`${command}\n`);

    return stream;
}


DockerUtil.prototype.execCommand = async function (name, command) {
    const container = this.docker.getContainer(name);
    const exec = await container.exec({
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: false,
        Cmd: command
    });

    return exec.start({
        Detach: false,
        Tty: true
    });
}

DockerUtil.prototype.restartContainer = async function (name, timeToKill) {
    const container = this.docker.getContainer(name);

    try {
        return await container.restart({ t: timeToKill });
    } catch (ex) {
        console.log('error restarting ' + name);
    }
}

DockerUtil.prototype.waitForContainer = async function (name, delay, condition) {
    const containerInspect = await this.inspectContainer(name);

    if (condition(containerInspect)) return containerInspect;
    await new Promise(resolve => setTimeout(resolve, delay))

    return await this.waitForContainer(name, delay, condition);
}

DockerUtil.prototype.waitForStream = function (stream) {
    return new Promise((resolve, reject) => {
        stream.on('data', data => resolve(data));
        stream.on('end', () => resolve());
        stream.on('close', () => resolve());
        stream.on('error', error => reject(error));
    })
}

module.exports.DockerUtil = DockerUtil

module.exports.fromInfrastructureId = async function (id) {
    const infrastructure = await Infrastructure.findById(id);

    return new DockerUtil(infrastructure);
}