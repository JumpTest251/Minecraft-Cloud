import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Profile from './views/Profile.vue'

import store from './store/store';

Vue.use(Router)


const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home

        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: { auth: false }
        }, 
        {
            path: '/register',
            name: 'register',
            component: Register,
            meta: { auth: false }
        }, 
        {
            path: '/profile',
            name: 'profile',
            component: Profile,
            meta: { auth: true }
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => typeof record.meta.auth !== 'undefined')) {
        if (!to.meta.auth && store.getters.loggedIn) {
            next({ path: '/' });
        }

        if (to.meta.auth && !store.getters.loggedIn) {
            next({ path: '/login' });
        }

    }

    next();

});

export default router;