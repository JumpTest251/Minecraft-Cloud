<template>
    <v-flex xs12 md8>
        <v-card class="mb-10">
            <v-card-title>Autopause</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-layout class="px-3" row>
                    <v-flex xs6 md4>
                        <div class="caption">Inaktivität</div>
                        <div class="black--text">
                            <span class="text-center">0 Spieler online</span>
                        </div>
                    </v-flex>
                    <v-flex xs12 md5 align-start>
                        <div class="caption">Dauer Inaktivität</div>
                        <div class="black--text">
                            <span>10 Minuten</span>
                        </div>
                    </v-flex>
                    <v-flex>
                        <div class="caption">Status</div>
                        <div v-if="autopause" class="success--text">
                            Aktiviert
                        </div>
                        <div v-else class="error--text">Deaktiviert</div>
                    </v-flex>
                </v-layout>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn
                    :color="autopause ? 'error' : 'success'"
                    text
                    :loading="loading"
                    @click="toggleAutopause(!autopause)"
                >
                    {{ autopause ? "Deaktivieren" : "Aktivieren" }}
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-divider class="my-5"></v-divider>
        <v-card>
            <v-toolbar class="blue-grey" dark elevation="2">
                <v-toolbar-title>Analytics</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn
                    :loading="refreshing"
                    @click="
                        refreshing = true;
                        fetchAnalytics();
                    "
                    icon
                >
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text>
                <v-layout :row="$vuetify.breakpoint.smAndDown" wrap>
                    <v-flex sm12>
                        <Chart
                            :series="playerSeries"
                            title="Spieler Online"
                            yTitle="Spieler"
                        />
                    </v-flex>
                    <v-flex sm12 md6>
                        <Chart
                            :series="memorySeries"
                            title="Speichernutzung"
                            yTitle="Memory in %"
                        />
                    </v-flex>
                    <v-flex sm12 md6>
                        <Chart
                            :series="cpuSeries"
                            title="CPU Nutzung"
                            yTitle="CPU in %"
                        />
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import config from "@/config";
import Chart from "./Chart";

export default {
    components: {
        Chart,
    },
    data() {
        return {
            playerSeries: [],
            memorySeries: [],
            cpuSeries: [],
            refreshing: false,
            autopause: false,
            loading: false,
        };
    },
    computed: {
        ...mapGetters(["userData", "server", "headers"]),
    },
    mounted() {
        this.fetchAnalytics();
        this.fetchAnalyticsSettings();
    },
    methods: {
        async fetchAnalytics() {
            const response = await this.$http.get(
                `${config.analyticsServiceUrl}/analytics/server/${this.$route.params.name}/${this.$route.params.server}/metrics`,
                this.headers
            );
            this.refreshing = false;

            const players = [];
            const memory = [];
            const cpu = [];

            for (const metric of response.data) {
                const toAdd = {
                    x: new Date(metric.time).getTime(),
                    y: metric.value,
                };

                if (metric.measurement === "players") players.push(toAdd);
                if (metric.measurement === "memory") memory.push(toAdd);
                if (metric.measurement === "cpu") cpu.push(toAdd);
            }

            this.playerSeries = [
                {
                    name: "players",
                    data: players,
                },
            ];

            this.memorySeries = [
                {
                    name: "usage",
                    data: memory,
                },
            ];

            this.cpuSeries = [
                {
                    name: "usage",
                    data: cpu,
                },
            ];
        },
        async fetchAnalyticsSettings() {
            const response = await this.$http.get(
                `${config.analyticsServiceUrl}/analytics/server/${this.$route.params.name}/${this.$route.params.server}`,
                this.headers
            );

            this.autopause = response.data.analyticsToken.autopause;
        },
        async toggleAutopause(toggle) {
            this.loading = true;

            await this.$http
                .put(
                    `${config.analyticsServiceUrl}/analytics/server/${this.$route.params.name}/${this.$route.params.server}`,
                    { autopause: toggle },
                    this.headers
                )
                .then(() => {
                    this.autopause = toggle;
                    this.loading = false;
                });
        },
    },
};
</script>
