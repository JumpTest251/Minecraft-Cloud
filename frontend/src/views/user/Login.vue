<template>
    <div>
        <v-container fluid fill-height class="my-5">
            <v-layout justify-center>
                <v-flex xs12 sm8 md5>
                    <v-card :loading="loading" class="elevation-6">
                        <v-toolbar class="blue-grey" dark>
                            <v-toolbar-title>Anmelden</v-toolbar-title>
                        </v-toolbar>
                       <LoginForm @twoFactorRequired="switch2FA" v-if="!twofa" />
                       <TwoFactorForm :username="username" v-else />
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
import LoginForm from '@/components/login/LoginForm';
import TwoFactorForm from '@/components/login/TwoFactorForm';


export default {
    data() {
        return {
            loading: false,
            twofa: false,
            username: ""
        }
    },
    components: {
        LoginForm,
        TwoFactorForm
    },
    methods: {
        switch2FA(username) {
            this.username = username;
            this.twofa = true;
        }
    }
}
</script>


<style>
.text-transform-none {
    text-transform: none !important;
}
</style>

