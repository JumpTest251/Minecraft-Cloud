import axios from 'axios';
import config from '@/config';

export default {
    login({ commit }, token) {
        localStorage.setItem('auth', token.token);
        localStorage.setItem('refreshToken', token.refresh);

        commit('updateToken', token.token);
        commit('updateRefreshToken', token.refresh);
    },
    logout({ commit }) {
        localStorage.removeItem('auth');
        localStorage.removeItem('refreshToken');

        commit('updateToken', '');
        commit('updateRefreshToken', '');
    },
    fetchUser({ getters, commit }) {
        return axios.get(`${config.userServiceUrl}/users/${getters.userData.username}`, getters.headers)
            .then(response => {
                commit('updateUser', response.data);
            });
    },
    updateUser({ getters, commit }, data) {
        return new Promise((resolve, reject) => {
            axios.put(`${config.userServiceUrl}/users/${getters.userData.username}`, data, getters.headers)
                .then(response => {
                    commit('updateUser', data);
                    resolve(response);
                })
                .catch(err => reject(err));
        });
    },
    updateToken({ getters, state, dispatch }) {
        return new Promise((resolve, reject) => {
            axios.post(`${config.userServiceUrl}/auth/refresh`, { refreshToken: state.refreshToken, name: getters.userData.username }).then(response => {
                dispatch('login', {
                    token: response.headers["authorization"],
                    refresh: state.refreshToken
                });

                resolve(response);
            }).catch(err => reject(err))
        });
    },
    async fetchServers({ getters, commit, dispatch }, username) {
        try {
            const servers = await axios.get(`${config.serverServiceUrl}/servers/${username}`, getters.headers);
            commit('updateServers', servers.data);

            for (const server of servers.data) {
                if (server.status === 'started' || server.status === 'stopped') {
                    dispatch('fetchServerStatus', { username, serverName: server.name })
                }
            }
        } catch (ex) {
            return ex;
        }
    },
    async fetchServerStatus({ getters, commit }, server) {
        try {
            const { username, serverName } = server
            const serverStatus = await axios.get(`${config.serverServiceUrl}/servers/${username}/${serverName}/status`, getters.headers);
            commit('updateServerStatus', { server: serverName, status: serverStatus.data });
            return serverStatus;
        } catch (ex) {
            console.log(ex);
        }
    },
    async fetchInfrastructure({ getters, commit }, username) {
        try {
            const serverList = await axios.get(`${config.serverServiceUrl}/infrastructure/user/${username}`, getters.headers);
            commit('updateInfrastructure', serverList.data);
        } catch (ex) {
            return ex;
        }
    },
    async fetchServer({ getters, commit, dispatch }, payload) {
        try {
            const template = await axios.get(`${config.serverServiceUrl}/servers/${payload.username}/${payload.server}`, getters.headers);
            commit('updateServer', template.data);
            if (template.data.status === 'started' || template.data.status === 'stopped') {
                await dispatch('fetchServerStatus', { username: payload.username, serverName: template.data.name })
            }
            await dispatch("fetchInfrastructureById", template.data.infrastructure);


        } catch (ex) {
            return ex;
        }
    },
    async fetchInfrastructureById({ getters, commit }, infrastructure) {
        try {
            const infra = await axios.get(`${config.serverServiceUrl}/infrastructure/${infrastructure}`, getters.headers);
            commit('updateInfrastructureId', infra.data);
        } catch (ex) {
            commit('updateInfrastructureId', {});

            return ex;
        }
    },
    async postAction({ getters }, payload) {
        const { action, username, server } = payload;
        try {
            await axios.post(`${config.serverServiceUrl}/servers/${username}/${server}/action`, { type: action }, getters.headers);
        } catch (ex) {
            console.log(ex);
        }
    }
}