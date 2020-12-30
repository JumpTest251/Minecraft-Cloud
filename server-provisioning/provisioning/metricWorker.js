const { metricImage, analyticsServiceUrl } = require('../utils/config');
const { fromInfrastructureId } = require('./docker/DockerUtil');
const { retrieveAnalytics } = require('../utils/serviceRequestor');


module.exports = async function (job) {
    const { serverTemplate, infrastructure } = job.data;
    const metricsContainerName = `metrics_${serverTemplate._id}`;

    const docker = await fromInfrastructureId(infrastructure);

    const inspect = await docker.inspectContainer(metricsContainerName);
    if (!inspect) {
        console.log("initializing metric collection");

        const analyticsToken = await retrieveAnalytics(serverTemplate);

        
        const dockerOptions = {
            name: metricsContainerName,
            Env: [
                `ANALYTICS_TOKEN=${analyticsToken.data.analyticsToken.token}`,
                `REPORTING_RATE=${analyticsToken.data.reportingRate}`,
                `SERVER=${serverTemplate._id}`,
                `REPORT_URL=${analyticsServiceUrl}/report`,
                `SERVER_PORT=${serverTemplate.port}`
            ],
            RestartPolicy: {
                Name: 'always'
            }
        }

        await docker.pullImage(metricImage);

        docker.runContainer(metricImage, dockerOptions);
    }

    return true;
}