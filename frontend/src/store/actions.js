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
    }
}