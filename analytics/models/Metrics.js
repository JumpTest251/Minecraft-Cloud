const { writeApi, queryApi, queryBuilder, deleteByTag } = require('../database/influxdb');
const PerformanceReport = require('../optimizing/PerformanceReport');
const MetricAnalyzer = require('../optimizing/MetricAnalyzer');

const { Point } = require('@influxdata/influxdb-client')
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

class Metrics {
    constructor(metrics, server) {
        this.metrics = metrics;
        this.server = server;
    }
    async insert() {
        const points = [];

        for (const metric of this.metrics) {
            const point = new Point(metric.type)
                .tag('server', this.server)
                .intField(this.field(metric.type), metric.value);
            points.push(point);
        }

        writeApi.writePoints(points);
        return writeApi.flush();
    }

    validate() {
        return Joi.object({
            metrics: Joi.array().unique('type').min(1).max(3).items(Joi.object({
                type: Joi.string().valid(...Metrics.validTypes()).required(),
                value: Joi.number().min(0).required()
            })).required(),
            server: Joi.objectId().required()
        }).validate(this);
    }

    generateReport() {
        return new PerformanceReport(this.getByType('players'), this.getByType('cpu'), this.getByType('memory'));
    }

    analyzer() {
        return new MetricAnalyzer(this.generateReport(), this.server);
    }

    getByType(type) {
        const metric = this.metrics.find(metric => metric.type === type);
        if (metric) return metric.value;
    }

    static validTypes() {
        return ['players', 'cpu', 'memory'];
    }

    static findMetrics(server) {
        const builder = queryBuilder()
            .range('30d')
            .filter()
            .tag('server', server).finish();

        return queryApi.collectRows(builder.query);
    }

    static deleteMetrics(server) {
        return deleteByTag('server', server);
    }

    field(type) {
        const options = {
            'players': 'online',
            'cpu': 'usage',
            'memory': 'usage'
        }

        return options[type];
    }
}


module.exports = Metrics;


