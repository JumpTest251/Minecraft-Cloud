const ProvisioningService = function(serverTemplate) {
    this.serverTemplate = serverTemplate;
    this.time = new Date().getMilliseconds();
}

ProvisioningService.prototype.create = function() {
    return this.time;
}

ProvisioningService.prototype.hostname = function() {
    const {name, createdBy} = this.serverTemplate;
    return name + "." + createdBy + ".server.minecraftcloud.de";
}

module.exports = ProvisioningService;