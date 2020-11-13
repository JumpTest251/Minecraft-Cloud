<template>
    <v-container class="my-5">
        <div class="display-1 mb-5">Meine Server</div>
        <v-divider></v-divider>
        <Alert
            v-if="servers.length < 1 && !error && !waitLoading"
            type="info"
            desc="Es wurden keine Server gefunden nutze Server erstellen um einen hinzuzufügen."
        />

        <v-layout justify-center row class="my-8">
            <v-flex class="text-center my-10" v-if="waitLoading" xs12>
                <v-progress-circular
                    indeterminate
                    color="blue-grey"
                    size="64"
                ></v-progress-circular>
            </v-flex>
            <v-flex xs12 md4 v-if="servers.length > 0">
                <v-btn router to="/create" large outlined block color="success"
                    >Server erstellen</v-btn
                >
            </v-flex>
            <v-flex xs12 md6 v-else>
                <v-btn
                    router
                    to="/create"
                    x-large
                    outlined
                    block
                    color="success"
                    dark
                    >Server erstellen</v-btn
                >
            </v-flex>

            <v-flex offset-xs-8 offset-md-6 xs1 v-if="servers.length > 0">
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            @click="fetchServers(true)"
                            v-on="on"
                            icon
                            color="info"
                            :loading="reloading"
                        >
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </template>
                    <span>Aktualisieren</span>
                </v-tooltip>
            </v-flex>
        </v-layout>
        <Alert
            v-if="error"
            type="error"
            desc="Server konnten nicht geladen werden."
        />
        <v-layout justify-center class="my-10">
            <v-flex xs12 md8>
                <v-card
                    :class="`mb-10  server ${server.status}`"
                    v-for="server in servers"
                    :key="server.name"
                    :loading="loading(server)"
                >
                    <template slot="progress">
                        <v-progress-linear
                            :color="
                                server.status === 'creating' ? 'blue' : 'orange'
                            "
                            indeterminate
                        ></v-progress-linear>
                    </template>
                    <v-card-title>{{ server.name }}</v-card-title>
                    <v-card-text>
                        <v-layout class="px-3" row>
                            <v-flex xs12 md5>
                                <div class="caption">Hostname</div>
                                <div class="black--text">
                                    <span>{{
                                        $store.getters.hostname(server.name)
                                    }}</span>
                                    <v-icon
                                        small
                                        right
                                        @click="
                                            copyClipboard(
                                                $store.getters.hostname(
                                                    server.name
                                                )
                                            )
                                        "
                                        >mdi-clipboard-text-outline</v-icon
                                    >
                                </div>
                            </v-flex>
                            <v-flex xs6 md4>
                                <div class="caption">Spieler</div>
                                <div class="black--text">
                                    {{
                                        isOnline(server)
                                            ? serverStatus[server.name].players
                                                  .online
                                            : "-"
                                    }}/{{
                                        isOnline(server)
                                            ? serverStatus[server.name].players
                                                  .max
                                            : "-"
                                    }}
                                </div>
                            </v-flex>
                            <v-flex>
                                <div class="caption">Status</div>
                                <div
                                    v-if="server.status === 'creating'"
                                    class="blue--text"
                                >
                                    Creating
                                </div>
                                <div
                                    v-else-if="server.status === 'restoring'"
                                    class="orange--text"
                                >
                                    Wiederherstellen
                                </div>
                                <div
                                    v-else-if="server.status === 'pausing'"
                                    class="orange--text"
                                >
                                    Pausieren
                                </div>
                                <div
                                    v-else-if="server.status === 'paused'"
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
                                    v-else-if="isOnline(server)"
                                    class="green--text"
                                >
                                    Online
                                </div>
                                <div v-else class="error--text">Offline</div>
                            </v-flex>
                            <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        @click="
                                            $router.push({
                                                path: server.name,
                                                append: true,
                                            })
                                        "
                                        text
                                        icon
                                        v-on="on"
                                    >
                                        <v-icon large>mdi-console</v-icon>
                                    </v-btn>
                                </template>
                                <span>Zum Webinterface</span>
                            </v-tooltip>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import Alert from "@/components/Alert";

export default {
    components: {
        Alert,
    },
    data() {
        return {
            error: false,
            reloading: true,
            waitLoading: true,
        };
    },
    computed: {
        ...mapGetters([
            "userData",
            "servers",
            "serverStatus",
            "isOnline",
            "loading",
            "isStarting",
        ]),
    },
    mounted() {
        this.fetchServers();
    },
    methods: {
        async fetchServers(reloading = false) {
            this.reloading = reloading;
            this.error = await this.$store.dispatch(
                "fetchServers",
                this.$route.params.name
            );

            this.reloading = false;
            this.waitLoading = false;
        },
        copyClipboard(toCopy) {
            navigator.clipboard.writeText(toCopy);
        },
    },
};
</script>

<style scoped>
.server.started {
    border-left: 4px solid #4caf50;
}
.server.stopped {
    border-left: 4px solid #ff5252;
}
.server.paused {
    border-left: 4px solid orange;
}
</style>