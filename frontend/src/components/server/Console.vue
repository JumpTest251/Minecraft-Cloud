<template>
    <v-flex xs12 md8>
        <v-card>
            <v-toolbar class="blue-grey" dark elevation="2">
                <v-toolbar-title>Konsole</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon :loading="reloading" @click="refreshConsole()">
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="mt-5">
                <v-layout row>
                    <v-flex
                        :class="[
                            $vuetify.breakpoint.xsOnly ? '' : 'mx-3',
                            'mb-1',
                        ]"
                    >
                        <v-card
                            outlined
                            class="overflow-y-auto"
                            max-height="640"
                        >
                            <v-card-text>
                                <v-layout v-if="reloading" justify-center>
                                    <v-progress-circular
                                        indeterminate
                                        color="blue-grey"
                                    ></v-progress-circular
                                ></v-layout>
                                <div
                                    v-for="(log, index) in logs"
                                    v-bind:key="index"
                                >
                                    <span>{{ log }}</span>
                                </div>
                                <span class="scrollto"></span>
                                <span v-if="noLogsFound && !reloading"
                                    >Keine Konsolen Ausgaben vorhanden.</span
                                >
                            </v-card-text>
                        </v-card>
                        <v-form
                            v-if="logs.length > 0 && !noLogsFound"
                            class="mt-5"
                        >
                            <v-text-field
                                :disabled="server.status !== 'started'"
                                prepend-inner-icon="mdi-console-line"
                                dense
                                v-model="command"
                                outlined
                                append-outer-icon="mdi-send"
                                placeholder="Befehl"
                                @keypress.enter.prevent="sendCommand"
                            >
                                <template v-slot:append-outer>
                                    <v-fade-transition leave-absolute>
                                        <v-progress-circular
                                            v-if="executing"
                                            size="24"
                                            color="blue-grey"
                                            indeterminate
                                        ></v-progress-circular>
                                        <v-icon v-else @click="sendCommand"
                                            >mdi-send</v-icon
                                        >
                                    </v-fade-transition>
                                </template>
                            </v-text-field>
                        </v-form>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import config from "@/config";

export default {
    data() {
        return {
            reloading: false,
            executing: false,
            command: "",
            logs: [],
            noLogsFound: false,
        };
    },
    computed: {
        ...mapGetters(["userData", "server", "headers"]),
    },
    mounted() {
        this.refreshConsole();
        this.$store.dispatch("fetchServer", {
            username: this.$route.params.name,
            server: this.$route.params.server,
        });
    },
    methods: {
        async refreshConsole(rel = true) {
            this.reloading = rel;
            try {
                const logs = await this.$http.get(
                    `${config.serverServiceUrl}/servers/${this.$route.params.name}/${this.$route.params.server}/logs`,
                    this.headers
                );

                if (!logs.data) {
                    this.noLogsFound = true;
                } else {
                    this.noLogsFound = false;
                }
                this.logs = logs.data.split("\n");

                const el = this.$el.getElementsByClassName("scrollto")[0];
                this.$nextTick(() => el.scrollIntoView(false));
            } catch (ex) {
                this.noLogsFound = true;
            }
            this.reloading = false;
        },
        async sendCommand() {
            if (!this.command || this.executing) return;

            this.executing = true;
            const response = await this.$http.post(
                `${config.serverServiceUrl}/servers/${this.$route.params.name}/${this.$route.params.server}/exec`,
                {
                    command: this.command,
                },
                this.headers
            );
            this.refreshConsole(false);
            this.$store.commit("updateSnackbar", {
                active: true,
                color: "info",
                timeout: 8000,
                content: response.data.message
                    ? this.filterColorCodes(response.data.message)
                    : "Befehl ausgeführt",
            });

            this.executing = false;
            this.command = "";
        },
        filterColorCodes(message) {
            let replaced = message;
            for (const color of this.$store.state.minecraft.colors) {
                replaced = replaced.replaceAll(`§${color}`, "");
            }

            return replaced;
        },
    },
};
</script>
