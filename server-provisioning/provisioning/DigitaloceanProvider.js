const digitalocean = require('digitalocean');
const config = require('../utils/config');

const DigitaloceanProvider = function () {
    this.client = digitalocean.client(config.doToken);
    this.sizes = {};

  /*  this.client.domains.listRecords('mcservers.me').then(data => {
        data.filter(el => el.type === 'A').forEach(el => this.client.domains.deleteRecord('mcservers.me', el.id))
    })*/
    this.loadSizes();
}

DigitaloceanProvider.prototype.requestDroplet = async function (serverTemplate, hostname) {
    const options = {
        name: hostname,
        region: 'fra1',
        size: this.sizes[serverTemplate.memory],
        image: serverTemplate.snapshot || "68142045",
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

DigitaloceanProvider.prototype.getDroplet = function (id) {
    return this.client.droplets.get(id);
}

DigitaloceanProvider.prototype.setupHostname = function (hostname, ip) {
    return this.client.domains.createRecord('mcservers.me', {
        type: 'A',
        name: hostname,
        data: ip
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