<template>
    <div>
        <v-card-text class="my-4">
            <v-subheader
                class="mb-4"
            >An die angegebene Email Adresse wird ein Bestätigungslink gesendet</v-subheader>
            <v-form ref="form">
                <v-text-field
                    v-model="email"
                    label="Email"
                    prepend-icon="mdi-account-box"
                    type="text"
                    :rules="emailRules"
                    @keyup.enter="sendReset()"
                    @keypress.enter.prevent
                ></v-text-field>
            </v-form>
        </v-card-text>
        <v-card-actions class="my-4">
            <v-layout column>
                <v-flex class="ma-3">
                    <v-btn
                        :loading="loading"
                        @click="sendReset()"
                        dark
                        x-large
                        block
                        color="blue-grey"
                    >Bestätigen</v-btn>
                </v-flex>
            </v-layout>
        </v-card-actions>
    </div>
</template>

<script>
import config from "@/config";

export default {
    data() {
        return {
            email: "",
            loading: false,
            emailRules: [
                v => !!v || "Email darf nicht leer sein",
                v => /^\S+@\S+\.\S+$/.test(v) || "Keine gültige Email"
            ]
        };
    },
    methods: {
        sendReset() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;

            this.$http
                .post(config.userServiceUrl + "/api/auth/reset", {
                    email: this.email
                })
                .then(() => {
                    this.$store.commit("updateSnackbar", {
                        active: true,
                        content: "Ein Bestätigungslink wurde versendet."
                    });

                    this.loading = false;
                    this.email = "";
                    this.$refs.form.resetValidation();
                });
        }
    }
};
</script>

