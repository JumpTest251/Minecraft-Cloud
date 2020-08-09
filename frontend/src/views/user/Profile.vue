<template>
    <v-container class="my-5">
        <div class="display-1 mb-5">Einstellungen</div>
        <v-divider></v-divider>
        <v-layout justify-center class="my-10">
            <v-flex xs12 sm10 md9>
                <v-card>
                    <v-toolbar flat color="blue-grey" dark>
                        <v-toolbar-title>Dein Profil</v-toolbar-title>
                    </v-toolbar>
                    <v-tabs>
                        <v-tab>
                            <v-icon left>mdi-account</v-icon>Allgemeines
                        </v-tab>
                        <v-tab>
                            <v-icon left>mdi-lock</v-icon>Sicherheit
                        </v-tab>

                        <v-tab-item>
                            <v-card flat>
                                <v-card-text>
                                    <v-form>
                                        <v-text-field
                                            readonly
                                            filled
                                            label="Username"
                                            type="text"
                                            v-model="userData.username"
                                            persistent-hint
                                            hint="Der Nutzername kann nicht geändert werden"
                                        ></v-text-field>

                                        <v-text-field
                                            readonly
                                            filled
                                            label="Email"
                                            type="text"
                                            v-model="user.email"
                                            persistent-hint
                                            hint="Die Email kann nicht geändert werden"
                                        ></v-text-field>
                                    </v-form>

                                    <v-divider class="my-4"></v-divider>
                                    <div class="subtitle-1">
                                        Zwei-Faktor-Authentifizierung:
                                        <span
                                            v-if="!twofaEnabled"
                                            class="error--text"
                                        >Deaktiviert</span>
                                        <span v-else class="success--text">Aktiviert</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card flat>
                                <v-card-text>
                                    <h3 class="my-5 blue-grey--text">Passwort ändern</h3>
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

                                        <v-btn
                                            @click="updatePassword()"
                                            :loading="loading"
                                            class="mt-2"
                                            outlined
                                            color="primary"
                                        >Passwort aktualisieren</v-btn>
                                    </v-form>

                                    <v-divider class="my-5"></v-divider>
                                    <h3
                                        class="mt-2 mb-5 blue-grey--text"
                                    >Zwei-Faktor-Authentifizierung</h3>
                                    <v-alert
                                        colored-border
                                        border="left"
                                        :color="twofaEnabled ? 'success' : 'error'"
                                        class="black--text"
                                    >
                                        <v-layout>
                                            <div>
                                                Status:
                                                <span
                                                    class="error--text"
                                                    v-if="!twofaEnabled"
                                                >Inaktiv</span>
                                                <span class="success--text" v-else>Akitv</span>
                                            </div>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                v-if="twofaEnabled"
                                                text
                                                :loading="confirmingLoading"
                                                class="text-transform-none"
                                                color="error"
                                                @click="confirming = true"
                                            >Entfernen</v-btn>
                                        </v-layout>
                                    </v-alert>
                                    <PopupConfirm
                                        @popupConfirmed="remove2FA()"
                                        @popupCanceled="confirming = false"
                                        :dialog="confirming"
                                        title="2FA entfernen?"
                                    />
                                    <Popup2FA />
                                </v-card-text>
                            </v-card>
                        </v-tab-item>
                    </v-tabs>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
import config from "@/config";
import { mapGetters } from "vuex";
import Popup2FA from "@/components/profile/Popup2FA";
import PopupConfirm from "@/components/PopupConfirm";

export default {
    components: {
        Popup2FA,
        PopupConfirm
    },
    data() {
        return {
            password: "",
            repeatPassword: "",
            show: false,
            loading: false,
            confirming: false,
            confirmingLoading: false,
            passwordRules: this.$store.state.globalRules.password,
            repeatPasswordRules: [
                v =>
                    (v && v === this.password) ||
                    "Passwörter stimmen nicht überein"
            ]
        };
    },
    computed: {
        ...mapGetters(["userData", "headers", "user"]),
        twofaEnabled() {
            return this.user.twofa && this.user.twofa.enabled;
        }
    },
    mounted() {
        this.fetchUser();
    },
    methods: {
        fetchUser() {
            this.$store.dispatch("fetchUser");
        },
        updatePassword() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            this.$http
                .put(
                    `${config.userServiceUrl}/users/${this.userData.username}`,
                    { password: this.password },
                    this.headers
                )
                .then(() => {
                    this.$store.commit("updateSnackbar", {
                        active: true,
                        content: "Passwort wurde aktualisiert"
                    });

                    this.$refs.form.resetValidation();
                    this.password = "";
                    this.repeatPassword = "";
                    this.loading = false;
                });
        },
        remove2FA() {
            this.confirming = false;
            this.confirmingLoading = true;

            this.$store
                .dispatch(
                    "updateUser",
                    {
                        twofa: {
                            enabled: false
                        }
                    },
                    this.headers
                )
                .then(() => {
                    this.$store.commit("updateSnackbar", {
                        active: true,
                        content: "2FA erfolgreich entfernt"
                    });

                    this.confirmingLoading = false;
                });
        }
    }
};
</script>
