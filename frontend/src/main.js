import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import vuetify from './plugins/vuetify';

import axios from 'axios';

axios.interceptors.response.use(undefined, error => {
    const { response } = error;

    if (error.config.headers.Authorization && store.getters.loggedIn && response.status === 401 && !error.config._isRetry && !response.config.url.includes("/auth/refresh")) {
        error.config._isRetry = true;

        return new Promise((resolve, reject) => {
            store.dispatch('updateToken').then(response => {
                error.config._isRetry = true;
                error.config.headers.Authorization = response.headers["authorization"];

                resolve(axios(error.config));
            }).catch(err => {
                router.push("/");
                store.dispatch('logout');

                reject(err);
            });
        })
    }

    return Promise.reject(error);
});

Vue.prototype.$http = axios;

Vue.config.productionTip = false

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')

