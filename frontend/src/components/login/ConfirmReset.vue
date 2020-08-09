<template>
    <div>
        <v-card-text class="my-4">
            <v-form ref="form">
                <v-text-field
                    prepend-icon="mdi-lock"
                    v-model="password"
                    label="Neues Passwort"
                    :type="show ? 'text' : 'password'"
                    :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show = !show"
                    :rules="passwordRules"
                ></v-text-field>
                <v-text-field
                    prepend-icon="mdi-lock-reset"
                    v-model="repeatPassword"
                    label="Passwort wiederholen"
                    :type="show ? 'text' : 'password'"
                    :rules="repeatPasswordRules"
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
                    >Passwort ändern</v-btn>
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
            password: "",
            repeatPassword: "",
            show: false,
            loading: false,
            passwordRules: this.$store.state.globalRules.password,
            repeatPasswordRules: [
                v =>
                    (v && v === this.password) ||
                    "Passwörter stimmen nicht überein"
            ]
        };
    },
    methods: {
        sendReset() {
            if (!this.$refs.form.validate()) return;
            this.loading = true;

            this.$http
                .post(
                    config.userServiceUrl +
                        `/auth/reset/${this.$route.params.token}`,
                    {
                        password: this.password
                    }
                )
                .then(() => {
                    this.$store.commit("updateSnackbar", {
                        active: true,
                        content: "Dein Passwort wurde zurückgesetzt."
                    });

                    this.$router.push("/login");

                    this.loading = false;
                })
                .catch(({ response }) => {
                    if (response.status === 404) {
                        this.$store.commit("updateSnackbar", {
                            active: true,
                            content: "Ungültiges Token",
                            color: "error"
                        });
                    }
                })
                .finally(() => (this.loading = false));
        }
    }
};
</script>
