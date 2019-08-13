<template>
    <div>
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
                    @keyup.enter="sendLogin()"
                    v-model="password"
                    label="Passwort"
                    prepend-icon="mdi-lock"
                    :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="show = !show"
                    :type="show ? 'text' : 'password'"
                    :rules="passwordRules"
                ></v-text-field>

                <div
                    class="red--text text-center subtitle-2 mt-3"
                    v-if="error"
                >Nutzername oder Passwort falsch</div>
            </v-form>
        </v-card-text>
        <v-card-actions class="my-4">
            <v-layout column>
                <v-flex>
                    <v-btn
                        :loading="loading"
                        @click="sendLogin()"
                        dark
                        x-large
                        block
                        color="blue-grey"
                    >Login</v-btn>
                </v-flex>
                <v-divider class="mt-4"></v-divider>
                <v-flex class="mt-8 text-center">
                    <v-layout row class="justify-space-between">
                        <v-flex>
                            <v-btn
                                router
                                to="/reset"
                                text
                                class="blue--text text-transform-none"
                            >Password vergessen?</v-btn>
                        </v-flex>
                        <v-flex>
                            <v-btn
                                router
                                to="/register"
                                text
                                class="blue--text text-transform-none"
                            >Account erstellen</v-btn>
                        </v-flex>
                    </v-layout>
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
            username: "",
            show: false,
            error: false,
            loading: false,
            passwordRules: [v => !!v || "Passwort muss angegeben werden"],
            nameRules: [v => !!v || "Username muss angegeben werden"]
        };
    },
    methods: {
        sendLogin() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;

            this.$http
                .post(config.userServiceUrl + "/api/auth", {
                    name: this.username,
                    password: this.password
                })
                .then(response => {
                    if (response.data.twoFactorRequired) {
                        return this.$emit("twoFactorRequired", this.username);
                    }

                    this.$store.dispatch(
                        "login",
                        response.headers["authorization"]
                    );

                    this.$router.push("/");
                })
                .catch(({ response }) => {
                    if (response.status == 401 || response.status == 404) {
                        this.error = true;
                    }

                    this.password = "";
                    this.$refs.form.resetValidation();
                })
                .finally(() => {
                    this.loading = false;
                });
        }
    }
};
</script>
