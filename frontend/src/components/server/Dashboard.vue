<template>
    <v-flex xs12 md8>
        <v-card>
            <v-overlay absolute :value="actionLoading">
                <v-progress-circular
                    indeterminate
                    size="64"
                ></v-progress-circular>
            </v-overlay>
            <v-toolbar class="blue-grey" dark elevation="2">
                <v-toolbar-title>Dashboard</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon :loading="reloading" @click="refreshServer">
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text>
                <v-layout row>
                    <v-flex
                        class="mx-3 mb-10"
                        :lg6="$vuetify.breakpoint.lgOnly"
                    >
                        <v-card outlined>
                            <v-card-title>Allgemein</v-card-title>
                            <v-card-text>
                                <v-layout row class="ma-2">
                                    <v-flex>
                                        <div class="caption">Status</div>
                                        <div
                                            v-if="server.status === 'creating'"
                                            class="blue--text"
                                        >
                                            Creating
                                        </div>
                                        <div
                                            v-else-if="
                                                server.status === 'pausing'
                                            "
                                            class="orange--text"
                                        >
                                            Pausieren
                                        </div>
                                        <div
                                            v-else-if="
                                                server.status === 'paused'
                                            "
                                            class="orange--text"
                                        >
                                            Pausiert
                                        </div>

                                        <div
                                            v-else-if="isStarting(server)"
                                            class="green--text"
                                        >
                                            Starting
                                        </div>
                                        <div
                                            v-else-if="isStopping(server)"
                                            class="error--text"
                                        >
                                            Stopping
                                        </div>
                                        <div
                                            v-else-if="isOnline(server)"
                                            class="green--text"
                                        >
                                            Online
                                        </div>
                                        <div v-else class="error--text">
                                            Offline
                                        </div>
                                    </v-flex>
                                    <v-spacer></v-spacer>
                                    <v-flex>
                                        <div class="caption">Spieler</div>
                                        <div class="black--text">
                                            {{
                                                isOnline(server)
                                                    ? serverStatus[server.name]
                                                          .players.online
                                                    : "-"
                                            }}/{{
                                                isOnline(server)
                                                    ? serverStatus[server.name]
                                                          .players.max
                                                    : "-"
                                            }}
                                        </div>
                                    </v-flex>
                                    <v-flex xs12>
                                        <div class="caption mt-5">Hostname</div>
                                        <div class="black--text">
                                            <span>{{
                                                hostname(server.name)
                                            }}</span>
                                        </div>
                                    </v-flex>
                                    <v-flex>
                                        <div class="caption mt-5">
                                            IP Adresse
                                        </div>
                                        <div class="black--text">
                                            <span>{{
                                                (infrastructureById.ip &&
                                                    `${infrastructureById.ip}:${server.port}`) ||
                                                "Nicht verfügbar"
                                            }}</span>
                                        </div>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex class="mx-3 mb-10" :lg5="$vuetify.breakpoint.lgOnly">
                        <v-card outlined>
                            <v-card-title>Aktionen</v-card-title>
                            <v-card-text>
                                <v-row>
                                    <v-col
                                        v-if="server.status !== 'started'"
                                        cols="12"
                                        sm="6"
                                    >
                                        <v-btn
                                            @click="confirmAction = 'start'"
                                            :disabled="loading(server)"
                                            block
                                            color="success"
                                        >
                                            <v-icon left>mdi-power</v-icon>Start
                                        </v-btn>
                                    </v-col>
                                    <v-col v-else cols="12" sm="6">
                                        <v-btn
                                            @click="confirmAction = 'stop'"
                                            :disabled="loading(server)"
                                            block
                                            color="error"
                                        >
                                            <v-icon left>mdi-power</v-icon>Stop
                                        </v-btn>
                                    </v-col>

                                    <v-col
                                        cols="12"
                                        sm="6"
                                        class="mb-5"
                                        v-if="
                                            isOnline(server) &&
                                            server.status === 'started'
                                        "
                                    >
                                        <v-btn
                                            @click="confirmAction = 'restart'"
                                            :disabled="loading(server)"
                                            block
                                            v-if="isOnline(server)"
                                            color="success"
                                        >
                                            <v-icon left>mdi-restart</v-icon
                                            >Neustart
                                        </v-btn>
                                    </v-col>
                                    <v-col
                                        cols="12"
                                        sm="6"
                                        v-if="server.status !== 'paused'"
                                    >
                                        <v-btn
                                            @click="confirmAction = 'pause'"
                                            block
                                            :disabled="
                                                server.status === 'creating'
                                            "
                                            :loading="
                                                server.status === 'pausing'
                                            "
                                            color="warning"
                                        >
                                            <v-icon left>mdi-pause</v-icon>Pause
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex class="mx-3 mb-10" xs12 v-if="server.ftpAccount">
                        <v-card outlined>
                            <v-card-title>SFTP Zugangsdaten</v-card-title>
                            <v-card-text>
                                <v-layout row class="ma-2">
                                    <v-flex>
                                        <div class="caption">Port</div>
                                        <div class="black--text">
                                            {{ server.ftpAccount.port }}
                                        </div>
                                    </v-flex>
                                    <v-flex>
                                        <div class="caption">Username</div>
                                        <div class="black--text">
                                            {{ server.ftpAccount.username }}
                                        </div>
                                    </v-flex>
                                    <v-flex xs12>
                                        <div class="caption mt-5">Password</div>
                                        <div class="black--text">
                                            <span v-if="showPassword">{{
                                                server.ftpAccount.password
                                            }}</span>
                                            <v-btn
                                                :ripple="false"
                                                v-else
                                                text
                                                depressed
                                                @click="showPassword = true"
                                                class="blue--text text-transform-none pa-0 clean-btn"
                                                >Anzeigen</v-btn
                                            >
                                        </div>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <PopupConfirm
            @popupConfirmed="executeAction(confirmAction)"
            @popupCanceled="confirmAction = ''"
            :dialog="!!confirmAction"
            :title="confirmTitles[confirmAction]"
        />
    </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import PopupConfirm from "@/components/PopupConfirm";

export default {
    components: {
        PopupConfirm,
    },
    data() {
        return {
            reloading: false,
            actionLoading: false,
            confirmAction: "",
            showPassword: false,
            confirmTitles: {
                stop: "Server herunterfahren?",
                start: "Server starten?",
                pause: "Server pausieren?",
                restart: "Server neustarten?",
            },
        };
    },
    computed: {
        ...mapGetters([
            "userData",
            "server",
            "serverStatus",
            "isOnline",
            "hostname",
            "loading",
            "isStarting",
            "isStopping",
            "infrastructureById",
        ]),
    },
    mounted() {},
    methods: {
        async refreshServer() {
            this.reloading = true;
            await this.$store.dispatch("fetchServer", {
                username: this.userData.username,
                server: this.$route.params.server,
            });

            this.reloading = false;
        },
        async executeAction(action) {
            this.actionLoading = true;
            this.confirmAction = "";
            this.$store.commit("updateSnackbar", {
                active: true,
                content: "Aktion an Server gesendet",
            });
            await this.$store.dispatch("postAction", {
                username: this.$route.params.name,
                server: this.$route.params.server,
                action,
            });
            await this.refreshServer();
            setTimeout(
                () => {
                    this.refreshServer();
                    this.actionLoading = false;
                },
                action === "restart" ? 5000 : 3000
            );
        },
    },
};
</script>
<style scoped>
.clean-btn:before {
    display: none;
}
</style>