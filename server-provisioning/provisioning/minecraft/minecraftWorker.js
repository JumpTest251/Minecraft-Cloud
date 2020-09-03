const { fromInfrastructureId } = require('../docker/DockerUtil');

module.exports = async function (job) {
    const { serverTemplate, infrastructure } = job.data;
    job.reportProgress(10)

    const docker = await fromInfrastructureId(infrastructure);
    job.reportProgress(20);

    const image = serverTemplate.image || 'itzg/minecraft-server'

    console.log('pulling image...')
    await docker.pullImage(image);
    job.reportProgress(50);

    docker.runContainer(image, {
        name: serverTemplate.name, Env: ['MOTD=Hosted by MinecraftCloud', 'EULA=true', 'INIT_MEMORY=512M', `MAX_MEMORY=${serverTemplate.memory}M`, 'TYPE=SPIGOT', 'VERSION=1.12.2'], HostConfig: {
            PortBindings: {
                "25565/tcp": [
                    {
                        HostPort: '25565'
                    }
                ]
            }
        }
    });
    job.reportProgress(80);

    return {};
}