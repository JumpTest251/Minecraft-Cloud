import Vue from 'vue'
import Vuex from 'vuex'

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    token: localStorage.getItem('auth') || '',
    user: {},
    snackbar: {
      active: false,
      color: "success",
      timeout: 5000,
      content: ''
    },
    globalRules: {
      password: [
        v => !!v || "Passwort darf nicht leer sein",
        v => v.length >= 6 && v.length <= 512 || "Passwort muss zwischen 6 und 512 Zeichen haben"
      ]
    }
  },
  mutations,
  actions,
  getters
})
