const { InfluxDB } = require('@influxdata/influxdb-client')
const { DeleteAPI } = require('@influxdata/influxdb-client-apis')

const { influxToken, influxOrg } = require('../utils/config');
const QueryBuilder = require('./QueryBuilder');

const bucket = 'mccloud';
const client = new InfluxDB({ url: 'https://eu-central-1-1.aws.cloud2.influxdata.com', token: influxToken });
const deleteAPI = new DeleteAPI(client);

module.exports.queryBuilder = () => new QueryBuilder(bucket);

module.exports.writeApi = client.getWriteApi(influxOrg, bucket);

module.exports.queryApi = client.getQueryApi(influxOrg);

module.exports.deleteByTag = function (tag, value) {
    return deleteAPI.postDelete({
        body: {
            start: '1970-01-01T00:00:00Z',
            stop: influxTime(new Date()),
            predicate: `${tag}="${value}"`
        },
        org: influxOrg,
        bucket
    })
};

function influxTime(d) {
    function pad(n) { return n < 10 ? '0' + n : n }
    return d.getUTCFullYear() + '-'
        + pad(d.getUTCMonth() + 1) + '-'
        + pad(d.getUTCDate()) + 'T'
        + pad(d.getUTCHours()) + ':'
        + pad(d.getUTCMinutes()) + ':'
        + pad(d.getUTCSeconds()) + 'Z'
}
