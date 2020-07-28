<template>
    <v-container fluid fill-height class="my-5">
        <v-layout justify-center>
            <v-flex xs12 sm8 md6>
                <v-card class="elevation-6">
                    <v-toolbar class="blue-grey" dark>
                        <v-toolbar-title>Registrieren</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text class="my-4">
                        <v-form ref="form">
                            <v-text-field
                                v-model="username"
                                label="Username"
                                prepend-icon="mdi-account-box"
                                type="text"
                                :rules="nameRules"
                            ></v-text-field>

                            <v-text-field
                                v-model="email"
                                label="Email"
                                prepend-icon="mdi-email"
                                type="text"
                                :rules="emailRules"
                            ></v-text-field>

                            <v-text-field
                                v-model="password"
                                label="Passwort"
                                prepend-icon="mdi-lock"
                                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                :type="show ? 'text' : 'password'"
                                :rules="passwordRules"
                                @click:append="show = !show"
                            ></v-text-field>
                            <v-text-field
                                @keyup.enter="submitRegister()"
                                v-model="repeatPassword"
                                label="Passwort wiederholen"
                                prepend-icon="mdi-lock-reset"
                                :rules="repeatPasswordRules"
                                :type="show ? 'text' : 'password'"
                            ></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions class="my-4">
                        <v-layout column>
                            <v-flex>
                                <v-btn
                                    :loading="loading"
                                    @click="submitRegister()"
                                    dark
                                    x-large
                                    block
                                    color="blue-grey"
                                >Registrieren</v-btn>
                            </v-flex>
                            <v-divider class="mt-4"></v-divider>
                            <v-flex class="mt-8 text-center">
                                <v-btn
                                    router
                                    to="/login"
                                    text
                                    class="blue--text text-transform-none"
                                >Bereits registriert? Anmelden</v-btn>
                            </v-flex>
                        </v-layout>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import config from "@/config";

export default {
    data() {
        return {
            loading: false,
            username: "",
            email: "",
            password: "",
            repeatPassword: "",
            error: "",
            show: false,
            repeatPasswordRules: [
                v =>
                    (v && v === this.password) ||
                    "Passwörter stimmen nicht überein"
            ],
            passwordRules: this.$store.state.globalRules.password,
            emailRules: [
                v => !!v || "Email darf nicht leer sein",
                v => /^\S+@\S+\.\S+$/.test(v) || "Keine gültige Email",
                v =>
                    !this.error ||
                    this.error !== v ||
                    "Email wird bereits benutzt"
            ],
            nameRules: [
                v => !!v || "Username darf nicht leer sein",
                v =>
                    (v.length >= 3 && v.length <= 25) ||
                    "Username muss zwischen 3 und 25 Zeichen haben",
                v => /^[\w]+$/.test(v) || "Username enthält ungültige Zeichen",
                v =>
                    !this.error ||
                    this.error != v ||
                    "Username wird bereits benutzt"
            ]
        };
    },
    methods: {
        submitRegister() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;

            this.$http
                .post(config.userServiceUrl + "/api/users", {
                    name: this.username,
                    email: this.email,
                    password: this.password
                })
                .then(response => {
                    this.$store.dispatch("login", {
                        token: response.headers["authorization"],
                        refresh: response.data.refresh
                    });
                    
                    this.$store.commit("updateSnackbar", {
                        active: true,
                        content: "Registrierung erfolgreich!"
                    });

                    this.$router.push("/");
                })
                .catch(({ response }) => {
                    if (response.status === 400) {
                        this.error = response.data.cause;
                    }

                    this.$refs.form.validate();
                })
                .finally(() => {
                    this.loading = false;
                });
        }
    }
};
</script>
