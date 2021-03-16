const digitaloceanProvider = require('./DigitaloceanProvider');
const { DigitaloceanProvider } = require('./DigitaloceanProvider');

const hetznerProvider = require('./HetznerProvider');

class ServerProvider {
    constructor(provider) {
        if (provider === 'digitalocean') {
            this.provider = digitaloceanProvider;
        } else {
            this.provider = hetznerProvider;
        }
    }

    async requestNewServer(serverTemplate, hostname) {
        const requested = await this.provider.requestDroplet(serverTemplate, hostname);
        return this.transformServer(requested);
    }

    async createSnapshot(id, name) {
        const action = await this.provider.createSnapshot(id, name);
        if (this.provider instanceof DigitaloceanProvider) return action;

        return {
            id: action.action.id,
            snapshotId: action.image.id
        }
    }

    deleteSnapshot(id) {
        return this.provider.deleteSnapshot(id);
    }

    removeServer(id) {
        return this.provider.removeDroplet(id);
    }

    async getServer(id) {
        const requested = await this.provider.getDroplet(id);
        return this.transformServer(requested, false);
    }

    getAction(id, actionId) {
        return this.provider.getAction(id, actionId);
    }

    transformServer(server, nested = true) {
        if (this.provider instanceof DigitaloceanProvider) {
            return {
                id: server.id,
                status: server.status,
                ip: server.networks && server.networks.v4 && server.networks.v4[1] && server.networks.v4[1].ip_address
            }
        }

 
        return {
            id: nested ? server.server.id : server.id,
            status: nested ? server.server.status : server.status,
            ip: nested ? server.server.publicNet.ipv4.ip : server.publicNet.ipv4.ip
        }
    }

    isValidSize(size) {
        return this.provider.isValidSize(size);
    }

    static isCreated(server) {
        return server.status !== 'new' && server.status !== 'initializing' && server.status !== 'starting' && server.status !== 'off';
    }
}


module.exports.ServerProvider = ServerProvider;

module.exports.fromProvider = function (provider) {
    return new ServerProvider(provider);
}