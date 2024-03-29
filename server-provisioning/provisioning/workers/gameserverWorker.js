const { fromInfrastructureId } = require('../docker/DockerUtil');
const mcConfig = require('../minecraft/minecraftConfig');
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
        const javaVersion = serverTemplate.javaVersion || mcConfig.defaultJavaVersion;
        const image = serverTemplate.image || mcConfig.defaultImage;
        const pullImage = `${image}:${javaVersion}`

        console.log('pulling image...')
        await docker.pullImage(pullImage);
        job.reportProgress(50);

        runContainer(docker, serverTemplate, pullImage);
    }

    await ServerTemplate.findOneAndUpdate({ _id: serverTemplate._id }, { status: 'started' });

    job.reportProgress(80);

    return serverTemplate.name;
}

function runContainer(docker, serverTemplate, image) {
    const type = serverTemplate.serverType || mcConfig.defaultType;
    let version = serverTemplate.version || mcConfig.defaultVersion;
    const memory = serverTemplate.provider === 'custom' ? serverTemplate.memory : serverTemplate.memory - 512;

    if ((version.includes('1.8') || version.includes('1.9') || version.includes('1.10')) && (type === 'spigot' || type === 'bukkit')) {
        version = `${version}-R0.1-SNAPSHOT-latest`;
    }

    const dockerStartOptions = {
        name: serverTemplate.name,
        Env: [`MOTD=\\u00A7e${serverTemplate.name}\\n \\u00A7r\\u00A7oHosted by MinecraftCloud`, 'EULA=true', 'INIT_MEMORY=512M', `MAX_MEMORY=${memory}M`, `TYPE=${type.toUpperCase()}`, `VERSION=${version}`, 'TZ=Europe/Berlin', 'JVM_XX_OPTS=-XX:+UseCompressedOops', `ICON=${mcConfig.defaultIcon}`],
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
        },
        Tty: true,
        OpenStdin: true,
        AttachStdout: false

    }

    if (serverTemplate.templateType === 'static') {
        dockerStartOptions.HostConfig.Binds = [`/home/mccloud/${serverTemplate.name}:/data`]
    }

    docker.runContainer(image, dockerStartOptions);
}