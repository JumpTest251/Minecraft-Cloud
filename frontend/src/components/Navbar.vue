<template>
    <nav>
        <v-navigation-drawer
            v-if="$vuetify.breakpoint.xsOnly"
            class="grey lighten-3"
            app
            v-model="drawer"
        >
            <v-list>
                <v-list-item-group>
                    <v-list-item v-for="route in routes" :key="route.name" router :to="route.link">
                        <v-list-item-action>
                            <v-icon>{{ route.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>{{ route.name }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app class="grey lighten-3">
            <v-app-bar-nav-icon v-if="$vuetify.breakpoint.xsOnly" @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title
                :class="[$vuetify.breakpoint.xsOnly ? '' : 'headline', 'text-uppercase']"
            >
                <v-layout>
                    <router-link to="/" tag="span" style="cursor: pointer">
                        <span>Minecraft</span>
                        <span class="font-weight-light">Cloud</span>
                    </router-link>
                </v-layout>
            </v-toolbar-title>

            <v-toolbar-items class="ml-8" v-if="!$vuetify.breakpoint.xsOnly">
                <v-btn
                    v-for="route in routes"
                    :key="route.name"
                    class="text-transform-none px-5"
                    text
                    router
                    :to="route.link"
                >
                    <v-icon v-if="route.icon" left>{{ route.icon }}</v-icon>
                    <span>{{ route.name }}</span>
                </v-btn>
            </v-toolbar-items>
            <v-spacer></v-spacer>
            <v-btn v-if="!loggedIn" text outlined router to="/login">
                <v-icon left class="hidden-xs-only">mdi-account</v-icon>
                <v-icon class="hidden-sm-and-up">mdi-account</v-icon>
                <span class="mr-2 hidden-xs-only">Anmelden</span>
            </v-btn>
            <v-menu offset-y v-else>
                <template v-slot:activator="{ on }">
                    <v-btn text v-on="on" class="text-transform-none">
                        <v-icon class="hidden-sm-and-up">mdi-account-circle</v-icon>
                        <span class="mr-1 hidden-xs-only">{{ userData.username }}</span>
                        <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item-group>
                        <v-list-item @click="logoutUser()">
                            <v-list-item-title class="text-center">
                                <span>Abmelden</span>
                                <v-icon right>mdi-logout-variant</v-icon>
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item router to="/profile">
                            <v-list-item-title class="text-center">
                                <span>Einstellungen</span>
                                <v-icon right>mdi-settings</v-icon>
                            </v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>
        </v-app-bar>
    </nav>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            drawer: false,
            baseRoutes: [{ name: "Home", link: "/", icon: "mdi-home" }]
        };
    },
    computed: {
        ...mapGetters(["loggedIn", "userData"]),
        routes() {
            let newRoutes = [];
            if (this.loggedIn) {
                newRoutes.push({
                    name: "Meine Server",
                    link: `/servers/${this.userData.username}`,
                    icon: "mdi-server"
                });
            }

            return [...this.baseRoutes, ...newRoutes];
        }
    },
    methods: {
        logoutUser() {
            this.$store.dispatch("logout");

            this.$router.push("/");
        }
    }
};
</script>

