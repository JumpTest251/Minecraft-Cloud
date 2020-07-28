import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/user/Login.vue'
import Register from './views/user/Register.vue'
import Profile from './views/user/Profile.vue'
import Reset from './views/user/Reset.vue'
import Servers from './views/Servers.vue'
import Webinterface from './views/Webinterface.vue'

import store from './store/store';

Vue.use(Router)

const baseTitle = 'MinecraftCloud - '

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: { title: 'Startseite'}
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: { auth: false, title: 'Anmelden' }
        },
        {
            path: '/register',
            name: 'register',
            component: Register,
            meta: { auth: false, title: 'Registrieren' }
        },
        {
            path: '/profile',
            name: 'profile',
            component: Profile,
            meta: { auth: true, title: 'Einstellungen' }
        },
        {
            path: '/reset/:token?',
            name: 'reset',
            component: Reset,
            meta: { auth: false , title: 'Reset'}
        },
        {
            path: '/servers/:name',
            name: 'servers',
            component: Servers,
            meta: { auth: true , title: 'Server'}
        },
        {
            path: '/servers/:name/:server',
            name: 'webinterface',
            component: Webinterface,
            meta: { auth: true , title: 'Webinterface'}
        }
    ]
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? baseTitle + to.meta.title : 'MinecraftCloud'

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