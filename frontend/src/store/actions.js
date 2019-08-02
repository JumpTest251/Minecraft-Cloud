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
    }
}