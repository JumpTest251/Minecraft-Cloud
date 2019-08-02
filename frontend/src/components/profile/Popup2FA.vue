<template>
    <v-dialog persistent v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on }">
            <v-btn outlined color="primary" v-on="on" class="my-4">2FA einrichten</v-btn>
        </template>
        <v-card>
            <v-card-title>
                <span class="headline">2FA einrichten</span>
            </v-card-title>
            <v-card-text>
                <v-subheader
                    class="mt-2"
                >Yubikey an den Computer anschließen und One-Time-Password generieren lassen</v-subheader>
                <v-form class="pa-5" ref="form">
                    <v-text-field
                        :rules="otpRules"
                        prepend-icon="mdi-key"
                        v-model="token"
                        label="Yubikey OTP"
                        @keypress.enter.prevent
                    ></v-text-field>
                </v-form>
                <v-container>
                    <v-layout row class="mt-6 mb-3">
                        <v-btn :loading="loading" @click="submit2FA()" outlined color="success">2FA aktivieren</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click="dialog = false" color="error" outlined>Abrechen</v-btn>
                    </v-layout>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import config from "@/config";
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            token: "",
            dialog: false,
            loading: false,
            otpRules: [v => !!v || "Feld darf nicht leer sein"]
        };
    },
    computed: {
        ...mapGetters(["headers", "userData"])
    },
    methods: {
        submit2FA() {
            this.loading = true;

            this.$http
                .put(
                    `${config.userServiceUrl}/api/users/${this.userData.username}`,
                    {
                        twofa: {
                            enabled: true,
                            otp: this.token
                        }
                    },
                    this.headers
                )
                .then(() => {
                    this.$store.commit("updateSnackbar", {
                        active: true,
                        content: "2FA erfolgreich eingerichtet"
                    });

                    this.$store.commit("updateUser", {
                        twofa: {
                            enabled: true
                        }
                    });
                })
                .catch(() => {
                    this.$store.commit("updateSnackbar", {
                        active: true,
                        color: "error",
                        content: "Einrichtung fehlgeschlagen: ungültiges OTP!"
                    });
                })
                .finally(() => {
                    this.loading = false;
                    this.token = "";
                    this.dialog = false;
                });
        }
    }
};
</script>
