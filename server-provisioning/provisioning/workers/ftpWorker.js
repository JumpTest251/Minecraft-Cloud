const ServerTemplate = require('../../models/ServerTemplate');
const { fromInfrastructureId } = require('../docker/DockerUtil');
const { randomString } = require('../../utils/utils');
const { ftpContainerName } = require('../minecraft/minecraftConfig');

module.exports = async function (job) {
    const { serverTemplate, infrastructure } = job.data;
    const docker = await fromInfrastructureId(infrastructure);

    const inspect = await docker.inspectContainer(ftpContainerName);
    if (!inspect) {
        console.log("creating sftp server");

        const ftpAccount = serverTemplate.ftpAccount || {
            port: 2222,
            username: serverTemplate.createdBy,
            password: randomString(12)
        }

        if (!serverTemplate.ftpAccount) {
            await ServerTemplate.findOneAndUpdate({ _id: serverTemplate._id }, { ftpAccount })
        }

        const dockerOptions = {
            name: ftpContainerName,
            Cmd: [`${ftpAccount.username}:${ftpAccount.password}:1000`],
            PortBindings: {
                "22/tcp": [
                    {
                        HostPort: `${ftpAccount.port}`
                    }
                ]
            },
            RestartPolicy: {
                Name: 'always'
            },
            Binds: [`/home/mccloud/${serverTemplate.name}:/home/${ftpAccount.username}/${serverTemplate.name}`]
        }

        await docker.pullImage('atmoz/sftp');

        docker.runContainer('atmoz/sftp', dockerOptions);
    }

    return true;
}