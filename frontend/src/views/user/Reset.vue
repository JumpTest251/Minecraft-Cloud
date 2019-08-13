<template>
    <v-container fluid fill-height class="my-5">
        <v-layout justify-center>
            <v-flex xs12 sm8 md5>
                <v-card class="elevation-6">
                    <v-toolbar class="blue-grey" dark>
                        <v-toolbar-title>Account zurücksetzen</v-toolbar-title>
                    </v-toolbar>
                    <RequestReset v-if="!$route.params.token" />
                    <ConfirmReset v-else />
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import RequestReset from '@/components/login/RequestReset';
import ConfirmReset from '@/components/login/ConfirmReset';

export default {
    components: {
        RequestReset,
        ConfirmReset
    }
};
</script>
