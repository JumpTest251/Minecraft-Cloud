const HetznerCloud = require('hcloud-js')
const config = require('../../utils/config');
const { defaultSshKey, hetznerSnapshot } = require('../minecraft/minecraftConfig');

class HetznerProvider {
    constructor() {
        this.client = new HetznerCloud.Client(config.hetznerToken);
        this.sizes = {};

        this.loadSizes();
    }

    async requestDroplet(serverTemplate, hostname) {
        const builder = this.client.servers.build(hostname)
            .serverType(this.sizes[serverTemplate.memory])
            .location('nbg1')
            .image(serverTemplate.snapshot || hetznerSnapshot)
            .sshKey(defaultSshKey);

        builder._labels = {
            type: 'minecraft',
            createdBy: serverTemplate.createdBy,
            name: serverTemplate.name,
            serverId: serverTemplate._id
        }

        return builder.create()
    }

    createSnapshot(id, name) {
        return this.client.servers.actions.createImage(id, 'snapshot', name);
    }

    deleteSnapshot(id) {
        return this.client.images.delete(id);
    }

    removeDroplet(id) {
        return this.client.servers.delete(id);
    }

    getDroplet(id) {
        return this.client.servers.get(id);
    }

    getAction(id, actionId) {
        return this.client.servers.actions.get(id, actionId);
    }

    isValidSize(size) {
        return this.sizes[size];
    }
    loadSizes() {
        this.sizes = {
            2048: 'cx11',
            4096: 'cx21',
            8192: 'cx31',
            16384: 'cx41'
        }

    }
}


const hetznerProvider = new HetznerProvider();

module.exports = hetznerProvider;
module.exports.HetznerProvider = HetznerProvider;