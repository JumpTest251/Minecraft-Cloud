class PerformanceReport {
    constructor(players, cpu, memory) {
        this.players = players;
        this.cpu = cpu;
        this.memory = memory;
    }

    containsPlayers() {
        return typeof this.players !== 'undefined';
    }

    containsCpu() {
        return typeof this.cpu !== 'undefined';
    }

    containsMemory() {
        return typeof this.memory !== 'undefined';
    }

    isActive() {
        return this.containsPlayers() && this.players > 0;
    }
}

module.exports = PerformanceReport;

