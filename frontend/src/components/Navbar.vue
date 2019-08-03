<template>
    <nav>
        <v-navigation-drawer class="grey lighten-3" app v-model="drawer">
            <v-list>
                <v-list-item-group>
                    <v-list-item router to="/">
                        <v-list-item-action>
                            <v-icon>mdi-home</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>Home</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app class="grey lighten-3">
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title
                :class="[$vuetify.breakpoint.xsOnly ? '' : 'headline', 'text-uppercase']"
            >
                <v-layout>
                    <span>Minecraft</span>
                    <span class="font-weight-light">Cloud</span>
                </v-layout>
            </v-toolbar-title>
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
                    <v-list-item @click="logoutUser()" @click.native="logoutUser()">
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
            drawer: false
        };
    },
    computed: {
        ...mapGetters(["loggedIn", "userData"])
    },
    methods: {
        logoutUser() {
            this.$store.dispatch("logout");

            this.$router.push("/");
        }
    }
};
</script>

