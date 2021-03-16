const digitalocean = require('digitalocean');
const config = require('../../utils/config');
const { doSnapshot, mcDomain } = require('../minecraft/minecraftConfig');

class DigitaloceanProvider {
    constructor() {
        this.client = digitalocean.client(config.doToken);
        this.sizes = {};

        /*  this.client.domains.listRecords('mcservers.me').then(data => {
              data.filter(el => el.type === 'A').forEach(el => this.client.domains.deleteRecord('mcservers.me', el.id))
          })*/
        // this.findTemplate().then(res => console.log("res: " + res.id))  
        this.loadSizes();
    }
    async requestDroplet(serverTemplate, hostname) {
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
        };

        return this.client.droplets.create(options);
    }
    removeDroplet(id) {
        return this.client.droplets.delete(id);
    }
    getDroplet(id) {
        return this.client.droplets.get(id);
    }
    getAction(id, actionId) {
        return this.client.droplets.getAction(id, actionId);
    }
    createSnapshot(id, name) {
        return this.client.droplets.snapshot(id, name);
    }
    getSnapshots(id) {
        return this.client.droplets.snapshots(id);
    }
    async deleteSnapshot(id) {
        return this.client.snapshots.delete(id);
    }
    async findTemplate(name = 'mctemplate') {
        const snapshots = await this.client.snapshots.list();
        return snapshots.find(snap => snap.name === name);
    }
    async deleteSnapshots(id) {
        const snapshots = await this.getSnapshots(id);
        snapshots.forEach(snap => {
            this.client.snapshots.delete(snap.id);
        });
    }
    setupHostname(hostname, ip) {
        return this.client.domains.createRecord(mcDomain, {
            type: 'A',
            name: hostname,
            data: ip,
            ttl: 120
        });
    }
    async removeHostname(hostname) {
        const records = await this.client.domains.listRecords(mcDomain, { name: hostname });
        records.forEach(record => {
            this.client.domains.deleteRecord(mcDomain, record.id);
        });
    }
    isValidSize(size) {
        return this.sizes[size];
    }
    loadSizes() {
        this.client.sizes.list().then(function (sizeList) {
            sizeList.filter(el => el.slug.startsWith('s')).forEach(function (element) {
                if (!this.sizes[element.memory]) {
                    this.sizes[element.memory] = element.slug;
                }
            }.bind(this));
        }.bind(this));
    }
}


const digitaloceanProvider = new DigitaloceanProvider();

module.exports = digitaloceanProvider;
module.exports.DigitaloceanProvider = DigitaloceanProvider;