import Vue from 'vue'
import Vuex from 'vuex'

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

Vue.use(Vuex)


export default new Vuex.Store({
    state: {
        token: localStorage.getItem('auth') || '',
        refreshToken: localStorage.getItem('refreshToken') || '',
        user: {},
        snackbar: {
            active: false,
            color: "success",
            timeout: 5000,
            content: ''
        },
        userServers: [],
        server: {},
        infrastructure: {},
        userInfrastructure: [],
        serverStatus: {},
        minecraft: {
            versions: ['1.8', '1.8.8', '1.9', '1.9.4', '1.10', '1.10.2', '1.11', '1.11.2', '1.12', '1.12.2', '1.13', '1.13.2', '1.14', '1.14.4', '1.15', '1.15.2', '1.16.1', '1.16.3', '1.16.4', '1.16.5', '1.17.1', '1.18.1'],
            software: ["Spigot", "Paper", "Bukkit", "Vanilla", "Custom"],
            javaVersions: ["latest", "java17", "java11", "java8"],
            managedMemory: [
                { text: "1 GB", value: 1024 },
                { text: "2 GB", value: 2048 },
                { text: "4 GB", value: 4096 },
                { text: "8 GB", value: 8192 },
                { text: "16 GB", value: 16384 }
            ],
            colors: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "k", "l", "m", "n", "o", "r"]

        },
        globalRules: {
            password: [
                v => !!v || "Passwort darf nicht leer sein",
                v => v.length >= 6 && v.length <= 512 || "Passwort muss zwischen 6 und 512 Zeichen haben"
            ],
            notEmpty: [
                v => !!v || "Feld darf nicht leer sein",
            ],

        }
    },
    mutations,
    actions,
    getters
})
