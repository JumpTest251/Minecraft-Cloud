const redis = require('redis');
const { redisUrl } = require('./config');
const { promisify } = require("util");

const client = redis.createClient({ url: redisUrl })
const get = promisify(client.get).bind(client);
const setex = promisify(client.setex).bind(client);

const Cache = function (key, ex = 3600, json = true) {
    this.key = key;
    this.ex = ex;
    this.json = json;
}

Cache.prototype.get = async function (loader) {
    try {
        const data = await get(this.key);
        if (data) return this.json ? JSON.parse(data) : data;

        const result = await loader(this.key);
        if (result) {
            await this.set(this.json ? JSON.stringify(result) : result);
        }
        return result;
    } catch (ex) {
        console.log('Redis err: ' + ex);
    }
}

Cache.prototype.set = function (value) {
    return setex(this.key, this.ex, value);
}

module.exports = Cache;