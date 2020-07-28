<template>
    <v-container class="my-5">
        <div class="display-1 mb-5">
            <span>{{ $route.params.server }}</span>
        </div>
        <v-divider></v-divider>
        <v-breadcrumbs large :items="breadcrumb" divider=">"></v-breadcrumbs>

        <v-layout row class="mt-5">
            <v-flex class="mb-5 mr-3" xs12 md3>
                <v-card elevation="6" max-width="250">
                    <v-navigation-drawer floating permanent>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title class="title">Server Verwaltung</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list dense rounded>
                            <v-list-item-group v-model="active">
                                <v-list-item v-for="item in routes" :key="item.title" link>
                                    <v-list-item-icon>
                                        <v-icon>{{ item.icon }}</v-icon>
                                    </v-list-item-icon>

                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-navigation-drawer>
                </v-card>
            </v-flex>

            <Dashboard v-if="active === 0" />
        </v-layout>
    </v-container>
</template>

<script>
import Dashboard from "@/components/server/Dashboard";

export default {
    components: {
        Dashboard
    },
    data() {
        return {
            active: 0,
            breadcrumb: [
                {
                    text: "Meine Server",
                    to: `/servers/${this.$route.params.name}`,
                    exact: true
                },
                {
                    text: this.$route.params.server,
                    to: this.$route.params.server
                }
            ],
            routes: [
                {
                    title: "Dashboard",
                    icon: "mdi-view-dashboard"
                },
                {
                    title: "Konsole",
                    icon: "mdi-console"
                },
                {
                    title: "Einstellungen",
                    icon: "mdi-settings"
                }
            ]
        };
    },
    watch: {
        active(newVal, oldVal) {
            if (newVal === undefined) {
                setTimeout(() => (this.active = oldVal), 1);
            }
        }
    }
};
</script>