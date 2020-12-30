const digitalocean = require('digitalocean');
const config = require('../utils/config');
const { doSnapshot, mcDomain } = require('./minecraft/minecraftConfig');

const DigitaloceanProvider = function () {
    this.client = digitalocean.client(config.doToken);
    this.sizes = {};

    /*  this.client.domains.listRecords('mcservers.me').then(data => {
          data.filter(el => el.type === 'A').forEach(el => this.client.domains.deleteRecord('mcservers.me', el.id))
      })*/
   // this.findTemplate().then(res => console.log("res: " + res.id))  
    this.loadSizes();
}

DigitaloceanProvider.prototype.requestDroplet = async function (serverTemplate, hostname) {
    const options = {
        name: hostname,
        region: 'fra1',
        size: this.sizes[serverTemplate.memory],
        image: serverTemplate.snapshot || doSnapshot,
        ssh_keys: [28101001],
        monitoring: true,
        tags: [
            "minecraft",
            serverTemplate.createdBy,
            serverTemplate.name
        ]

    }

    return this.client.droplets.create(options);
}

DigitaloceanProvider.prototype.removeDroplet = function (id) {
    return this.client.droplets.delete(id);
}

DigitaloceanProvider.prototype.getDroplet = function (id) {
    return this.client.droplets.get(id);
}

DigitaloceanProvider.prototype.getAction = function (id, actionId) {
    return this.client.droplets.getAction(id, actionId);
}

DigitaloceanProvider.prototype.createSnapshot = function (id, name) {
    return this.client.droplets.snapshot(id, name);
}

DigitaloceanProvider.prototype.getSnapshots = function (id) {
    return this.client.droplets.snapshots(id);
}
DigitaloceanProvider.prototype.deleteSnapshot = async function (id) {
    return this.client.snapshots.delete(id);
}

DigitaloceanProvider.prototype.findTemplate = async function (name = 'mctemplate') {
    const snapshots = await this.client.snapshots.list();
    return snapshots.find(snap => snap.name === name);
}

DigitaloceanProvider.prototype.deleteSnapshots = async function (id) {
    const snapshots = await this.getSnapshots(id);
    snapshots.forEach(snap => {
        this.client.snapshots.delete(snap.id);
    })
}

DigitaloceanProvider.prototype.setupHostname = function (hostname, ip) {
    return this.client.domains.createRecord(mcDomain, {
        type: 'A',
        name: hostname,
        data: ip,
        ttl: 120
    })
}

DigitaloceanProvider.prototype.removeHostname = async function (hostname) {
    const records = await this.client.domains.listRecords(mcDomain, { name: hostname });
    records.forEach(record => {
        this.client.domains.deleteRecord(mcDomain, record.id);
    })
}

DigitaloceanProvider.prototype.isValidSize = function (size) {
    return this.sizes[size];
}

DigitaloceanProvider.prototype.loadSizes = function () {
    this.client.sizes.list().then(function (sizeList) {
        sizeList.filter(el => el.slug.startsWith('s')).forEach(function (element) {
            if (!this.sizes[element.memory]) {
                this.sizes[element.memory] = element.slug;
            }
        }.bind(this));
    }.bind(this))
}


const digitaloceanProvider = new DigitaloceanProvider();

module.exports = digitaloceanProvider;