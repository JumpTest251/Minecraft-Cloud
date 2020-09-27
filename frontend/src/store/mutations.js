export default {
    updateToken(state, token) {
        state.token = token;
    },
    updateRefreshToken(state, refreshToken) {
        state.refreshToken = refreshToken;
    },
    updateSnackbar(state, snackbar) {
        if (snackbar.active) {
            state.snackbar.color = snackbar.color || "success";

        }
        state.snackbar.active = false;

        state.snackbar.active = snackbar.active;
        //state.snackbar.color = snackbar.color || "success";
        state.snackbar.timeout = snackbar.timeout || 5000;
        state.snackbar.content = snackbar.content || '';
    },
    updateUser(state, user) {
        state.user = { ...state.user, ...user };
    },
    updateServers(state, servers) {
        state.userServers = servers;
    },
    updateServer(state, server) {
        state.server = server;
    },
    updateInfrastructureId(state, infrastructure) {
        state.infrastructure = infrastructure;
    },
    updateInfrastructure(state, infrastructure) {
        state.userInfrastructure = infrastructure;
    },
    addInfrastructure(state, infrastructure) {
        state.userInfrastructure = [...state.userInfrastructure, infrastructure];
    },
    updateServerStatus(state, payload) {
        const { server, status } = payload;
        const update = {};
        update[server] = status;
        state.serverStatus = { ...state.serverStatus, ...update }
    }
}