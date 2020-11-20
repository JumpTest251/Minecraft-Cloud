<template>
    <v-flex xs12 md8>
        <v-alert
            v-if="!canEnable(server)"
            outlined
            type="warning"
            prominent
            border="left"
        >
            Automatische Backups können für diesen Server nicht aktiviert
            werden.
        </v-alert>

        <v-card class="mb-10" v-if="showBackup(server)">
            <v-card-title>Automatische Backups</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-layout class="px-3" row>
                    <v-flex xs12 md5 align-start>
                        <div class="caption">Letzes Backup</div>
                        <div class="black--text">
                            <span>{{
                                (backupEnabled(server) &&
                                    server.backup.last &&
                                    formatDate(server.backup.last)) ||
                                "Nicht verfügbar"
                            }}</span>
                        </div>
                    </v-flex>
                    <v-flex xs6 md4>
                        <div class="caption">Maximale Backups</div>
                        <div class="black--text">
                            <span class="text-center">5</span>
                        </div>
                    </v-flex>
                    <v-flex>
                        <div class="caption">Status</div>
                        <div v-if="backupEnabled(server)" class="success--text">
                            Aktiviert
                        </div>
                        <div v-else class="error--text">Deaktiviert</div>
                    </v-flex>
                </v-layout>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn
                    :color="backupEnabled(server) ? 'error' : 'success'"
                    text
                    :loading="toggling"
                    @click="toggleBackup(!backupEnabled(server))"
                >
                    {{ backupEnabled(server) ? "Deaktivieren" : "Aktivieren" }}
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-divider v-if="showBackup(server)" class="my-5"></v-divider>
        <div class="text-center">
            <v-progress-circular
                v-if="backups.length <= 0 && refreshing"
                indeterminate
                class="text-center"
                color="blue-grey"
                size="64"
            ></v-progress-circular>
        </div>
        <v-layout v-if="backups.length > 0">
            <div class="display-1 mb-5">
                <span>Verfügbare Backups</span>
            </div>
            <v-spacer></v-spacer>
            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <v-btn
                        @click="loadBackups"
                        v-on="on"
                        icon
                        color="info"
                        :loading="refreshing"
                    >
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </template>
                <span>Aktualisieren</span>
            </v-tooltip>
        </v-layout>
        <v-data-table
            v-if="backups.length > 0"
            hide-default-footer
            :headers="tableHead"
            :items="backups"
            sort-by="name"
            class="elevation-1"
        >
            <template v-slot:item.actions="{ item }">
                <v-btn
                    x-small
                    outlined
                    class="mr-2"
                    color="warning"
                    :disabled="!isAvailable(server)"
                    :loading="restore && generation === item.generation"
                    @click="confirm(item.generation)"
                    >Wiederherstellen</v-btn
                >
                <v-btn
                    x-small
                    outlined
                    @click="requestDownload(item.generation)"
                    color="info"
                    >Download</v-btn
                >
            </template>
            <template v-slot:item.mb="{ item }">
                <span>{{ Math.round(item.size / 1000000.0) }} MB</span>
            </template>
            <template v-slot:item.date="{ item }">
                <span>{{ formatDate(new Date(item.created)) }}</span>
            </template>
        </v-data-table>
        <Alert
            v-else-if="backups.length <= 0 && !refreshing && showBackup(server)"
            type="info"
            desc="Es gibt aktuell keine Backups für diesen Server"
        />
        <PopupConfirm
            @popupConfirmed="restoreBackup()"
            @popupCanceled="confirming = false"
            :dialog="confirming"
            title="Wiederherstellung starten?"
        />
    </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import config from "@/config";
import PopupConfirm from "@/components/PopupConfirm";
import Alert from "@/components/Alert";

export default {
    components: {
        PopupConfirm,
        Alert,
    },
    data() {
        return {
            toggling: false,
            refreshing: true,
            restore: false,
            confirming: false,
            generation: -1,
            backups: [],
            tableHead: [
                {
                    text: "Erstellt",
                    align: "start",
                    value: "date",
                    sortable: false,
                },
                { text: "Größe", value: "mb", sortable: false },
                {
                    text: "Actions",
                    align: "center",
                    value: "actions",
                    sortable: false,
                },
            ],
        };
    },
    computed: {
        ...mapGetters(["userData", "server", "headers", "isAvailable"]),
    },
    mounted() {
        this.loadBackups();
    },
    methods: {
        confirm(generation) {
            this.confirming = true;
            this.generation = generation;
        },
        async toggleBackup(toggle) {
            this.toggling = true;
            await this.$http.patch(
                `${config.serverServiceUrl}/servers/${this.$route.params.name}/${this.$route.params.server}/backup`,
                { enable: toggle },
                this.headers
            );
            this.$store.dispatch("fetchServer", {
                username: this.$route.params.name,
                server: this.$route.params.server,
            });

            this.toggling = false;
        },
        async loadBackups() {
            this.refreshing = true;
            const response = await this.$http.get(
                `${config.serverServiceUrl}/servers/${this.$route.params.name}/${this.$route.params.server}/backup`,
                this.headers
            );
            this.backups = response.data.reverse();
            this.refreshing = false;
        },
        async restoreBackup() {
            this.confirming = false;
            this.restore = true;
            await this.$http.post(
                `${config.serverServiceUrl}/servers/${this.$route.params.name}/${this.$route.params.server}/backup`,
                { action: "restore", generation: this.generation },
                this.headers
            );
            this.restore = false;
            this.$store.commit("updateServer", {
                ...this.server,
                status: "restoring",
            });
            this.$store.commit("updateSnackbar", {
                active: true,
                content: "Wiederherstellung gestartet.",
            });
        },
        requestDownload(generation) {
            this.$http
                .get(
                    `${config.serverServiceUrl}/servers/${this.$route.params.name}/${this.$route.params.server}/backup/${generation}`,
                    this.headers
                )
                .then(({ data }) => {
                    if (data.url) {
                        window.location.href = data.url;
                    }
                });
        },
        backupEnabled(server) {
            return server.backup && server.backup.enabled;
        },
        canEnable(server) {
            return (
                server.provider !== "custom" &&
                server.templateType !== "dynamic"
            );
        },
        showBackup(server) {
            return this.canEnable(server) || this.backupEnabled(server);
        },
        formatDate(value) {
            const date = new Date(value);
            return (
                date.toLocaleDateString() +
                ` - ${date.getHours()}:${date.getMinutes()}`
            );
        },
    },
};
</script>
