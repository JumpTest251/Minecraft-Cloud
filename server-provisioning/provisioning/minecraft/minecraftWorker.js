const { fromInfrastructureId } = require('../docker/DockerUtil');
const mcConfig = require('./minecraftConfig');
const ServerTemplate = require('../../models/ServerTemplate');

module.exports = async function (job) {
    const { serverTemplate, infrastructure } = job.data;
    job.reportProgress(10)

    const docker = await fromInfrastructureId(infrastructure);
    job.reportProgress(20);


    const inspect = await docker.inspectContainer(serverTemplate.name);
    job.reportProgress(30);
    if (inspect) {
        console.log('trying to start container');
        docker.startContainer(serverTemplate.name);
    } else {
        const image = serverTemplate.image || mcConfig.defaultImage;

        console.log('pulling image...')
        await docker.pullImage(image);
        job.reportProgress(50);

        runContainer(docker, serverTemplate, image);
    }

    await ServerTemplate.findOneAndUpdate({ _id: serverTemplate._id }, { status: 'started' });

    job.reportProgress(80);

    return serverTemplate.name;
}

function runContainer(docker, serverTemplate, image) {
    const type = serverTemplate.serverType || mcConfig.defaultType;
    let version = serverTemplate.version || mcConfig.defaultVersion;

    if ((version.includes('1.8') || version.includes('1.9') || version.includes('1.10')) && (type === 'spigot' || type === 'bukkit')) {
        version = `${version}-R0.1-SNAPSHOT-latest`;
    }

    const dockerStartOptions = {
        name: serverTemplate.name,
        Env: ['MOTD=Hosted by MinecraftCloud', 'EULA=true', 'INIT_MEMORY=512M', `MAX_MEMORY=${serverTemplate.memory}M`, `TYPE=${type.toUpperCase()}`, `VERSION=${version}`, 'TZ=Europe/Berlin', 'USE_AIKAR_FLAGS=true'],
        HostConfig: {
            PortBindings: {
                "25565/tcp": [
                    {
                        HostPort: `${serverTemplate.port}`
                    }
                ]
            },
            RestartPolicy: {
                Name: 'unless-stopped'
            }
        }
    }

    if (serverTemplate.templateType === 'static') {
        dockerStartOptions.HostConfig.Binds = [`/home/mccloud/${serverTemplate.name}:/data`]
    }

    docker.runContainer(image, dockerStartOptions);
}