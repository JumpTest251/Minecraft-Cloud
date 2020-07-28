<template>
    <div>
        <v-card-text class="my-4">
            <v-subheader
                class="mb-4"
            >Yubikey an den Computer anschließen und One-Time-Password generieren lassen</v-subheader>
            <v-form ref="form">
                <v-text-field
                    v-model="otp"
                    label="Yubikey OTP"
                    prepend-icon="mdi-key"
                    type="text"
                    :rules="otpRules"
                    @keypress.enter.prevent
                ></v-text-field>
            </v-form>
        </v-card-text>
        <v-card-actions class="my-4">
            <v-layout column>
                <v-flex>
                    <v-btn
                        :loading="loading"
                        @click="verify()"
                        dark
                        x-large
                        block
                        color="blue-grey"
                    >Verifizieren</v-btn>
                </v-flex>
                <v-divider class="mt-4"></v-divider>
                <v-flex class="mt-8 text-center">
                    <v-btn
                        router
                        to="/reset"
                        text
                        class="blue--text text-transform-none"
                    >2FA zurücksetzen</v-btn>
                </v-flex>
            </v-layout>
        </v-card-actions>
    </div>
</template>
<script>
import config from "@/config";

export default {
    props: ["username"],
    data() {
        return {
            otp: "",
            loading: false,
            otpRules: [v => !!v || "Feld darf nicht leer sein"]
        };
    },
    computed: {
        headers() {
            return this.$store.getters.headers;
        }
    },
    methods: {
        verify() {
            if (!this.$refs.form.validate()) return;
            this.loading = true;

            this.$http
                .post(`${config.userServiceUrl}/api/auth/2fa`, {
                    name: this.username,
                    otp: this.otp
                })
                .then(response => {
                    this.$store.dispatch("login", {
                        token: response.headers["authorization"],
                        refresh: response.data.refresh
                    });

                    this.$router.push("/");
                })
                .catch(() => {
                    this.$store.commit("updateSnackbar", {
                        active: true,
                        color: "error",
                        content: "Ungültiges OTP!"
                    });
                })
                .finally(() => {
                    this.loading = false;
                });
        }
    }
};
</script>

