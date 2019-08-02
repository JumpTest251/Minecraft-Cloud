<template>
    <div>
        <v-container fluid fill-height class="my-5">
            <v-layout justify-center>
                <v-flex xs12 sm8 md5>
                    <v-card :loading="loading" class="elevation-6">
                        <v-toolbar class="blue-grey" dark>
                            <v-toolbar-title>Anmelden</v-toolbar-title>
                        </v-toolbar>
                       <LoginForm />
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
import LoginForm from '@/components/login/LoginForm';

export default {
    data() {
        return {
            loading: false
        }
    },
    components: {
        LoginForm
    }
}
</script>


<style>
.text-transform-none {
    text-transform: none !important;
}
</style>

