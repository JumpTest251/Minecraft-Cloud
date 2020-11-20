export default {
    userData(state) {
        const token = state.token;
        if (!token) return;

        const base64Url = token.split('.')[1];
        return JSON.parse(atob(base64Url));

    },
    loggedIn(state) {
        return !!state.token;
    },
    headers(state) {
        return {
            headers: {
                Authorization: state.token
            }
        }
    },
    user(state) {
        return state.user;
    },
    servers(state) {
        return state.userServers
    },
    server(state) {
        return state.server;
    },
    infrastructureById(state) {
        return state.infrastructure
    },
    infrastructure(state) {
        return state.userInfrastructure
    },
    serverStatus(state) {
        return state.serverStatus
    },
    isOnline(state) {
        return server => {
            return state.serverStatus[server.name] && state.serverStatus[server.name].players && server.status !== 'pausing' && server.status !== 'paused' && server.status !== 'creating' && server.status !== 'restoring'
        }
    },
    hostname(state, getters) {
        return server => {
            return `${server}.${getters.userData.username}.mcservers.me`.toLowerCase()
        }
    },
    loading() {
        return server => {
            return server.status === "creating" || server.status === "pausing" || server.status === 'restoring'
        }
    },
    isAvailable() {
        return server => {
            return server.status === "started" || server.status === "stopped"
        }
    },
    isStarting(state, getters) {
        return server => {
            return server.status === "started" && !getters.isOnline(server)
        }
    },
    isStopping(state, getters) {
        return server => {
            return server.status === "stopped" && getters.isOnline(server)
        }
    }
}