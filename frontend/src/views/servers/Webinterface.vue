<template>
    <v-container :fluid="$vuetify.breakpoint.lgAndDown" class="my-5">
        <div class="display-1 mb-5">
            <span>{{ $route.params.server }}</span>
        </div>
        <v-divider></v-divider>
        <v-breadcrumbs large :items="breadcrumb" divider=">"></v-breadcrumbs>
        <Alert
            v-if="error"
            type="error"
            desc="Server konnte nicht gefunden werden."
        />

        <v-layout v-else row class="mt-5">
            <v-flex class="mb-5 mr-3" xs12 md3>
                <v-card
                    elevation="6"
                    :max-width="$vuetify.breakpoint.smAndDown ? 1000 : 250"
                >
                    <v-navigation-drawer floating permanent>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title class="title"
                                    >Server Verwaltung</v-list-item-title
                                >
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list dense rounded>
                            <v-list-item-group v-model="active">
                                <v-list-item
                                    v-for="item in routes"
                                    :key="item.title"
                                    link
                                >
                                    <v-list-item-icon>
                                        <v-icon>{{ item.icon }}</v-icon>
                                    </v-list-item-icon>

                                    <v-list-item-content>
                                        <v-list-item-title>{{
                                            item.title
                                        }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-navigation-drawer>
                </v-card>
            </v-flex>

            <Dashboard v-if="active === 0" />
            <Console v-if="active === 1" />
            <Settings v-if="active === 2" />
            <Backup v-if="active === 3" />
            <Analytics v-if="active === 4" />
        </v-layout>
    </v-container>
</template>

<script>
import Dashboard from "@/components/server/Dashboard";
import Console from "@/components/server/Console";
import Settings from "@/components/server/Settings";
import Backup from "@/components/server/Backup";
import Analytics from "@/components/server/Analytics";

import { mapGetters } from "vuex";
import Alert from "@/components/Alert";

export default {
    components: {
        Dashboard,
        Alert,
        Console,
        Settings,
        Backup,
        Analytics,
    },
    data() {
        return {
            active: 0,
            error: false,
            breadcrumb: [
                {
                    text: "Meine Server",
                    to: `/servers/${this.$route.params.name}`,
                    exact: true,
                },
                {
                    text: this.$route.params.server,
                    to: this.$route.params.server,
                },
            ],
            routes: [
                {
                    title: "Dashboard",
                    icon: "mdi-view-dashboard",
                },
                {
                    title: "Konsole",
                    icon: "mdi-console",
                },
                {
                    title: "Einstellungen",
                    icon: "mdi-cog",
                },
                {
                    title: "Backups",
                    icon: "mdi-history",
                },
                {
                    title: "Performance",
                    icon: "mdi-chart-areaspline-variant",
                },
            ],
        };
    },
    computed: {
        ...mapGetters(["userData"]),
    },
    mounted() {
        this.fetchServer();
    },
    methods: {
        async fetchServer() {
            this.error = await this.$store.dispatch("fetchServer", {
                username: this.userData.username,
                server: this.$route.params.server,
            });
        },
    },
    watch: {
        active(newVal, oldVal) {
            if (newVal === undefined) {
                setTimeout(() => (this.active = oldVal), 1);
            }
        },
    },
};
</script>