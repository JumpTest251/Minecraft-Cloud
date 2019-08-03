import axios from 'axios';
import config from '@/config';

export default {
    login({ commit }, token) {
        localStorage.setItem('auth', token);
        commit('updateToken', token);
    },
    logout({ commit }) {
        localStorage.removeItem('auth');
        commit('updateToken', '');
    },
    fetchUser({ getters, commit }) {
        axios.get(`${config.userServiceUrl}/api/users/${getters.userData.username}`, getters.headers)
            .then(response => {
                commit('updateUser', response.data);
            });
    },
    updateUser({ getters, commit }, data) {
        return new Promise((resolve, reject) => {
            axios.put(`${config.userServiceUrl}/api/users/${getters.userData.username}`, data, getters.headers)
                .then(response => {
                    commit('updateUser', data);
                    resolve(response);
                })
                .catch(err => reject(err));
        });
    }
}