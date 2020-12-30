const { caching: { Cache } } = require('@jumper251/core-module');
const { pauseAfter } = require('../utils/config');
const { requestServerDetails, requestServerPause } = require('../utils/serviceRequestor');

class MetricAnalyzer {
    constructor(performanceReport, server) {
        this.performanceReport = performanceReport;
        this.server = server;
    }
    async analyze(settings) {
        if (settings.autopause) this.checkAutopause();
    }

    async checkAutopause() {
        const lastActivity = new Cache(`analytics:activity:${this.server}`, 900, false);
        if (this.performanceReport.isActive()) {
            await lastActivity.set(new Date().getTime());
        } else if (this.performanceReport.containsPlayers()) {
            const last = await lastActivity.get();

            if (last) {
                const secs = (new Date().getTime() - last) / 1000;

                if (secs >= pauseAfter) this.requestPause();
            }
        }
    }

    async requestPause() { 
        const server = await requestServerDetails(this.server);

        return requestServerPause(server.data);
    }
}


module.exports = MetricAnalyzer;
