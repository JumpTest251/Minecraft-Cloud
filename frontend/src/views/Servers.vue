<template>
    <v-container class="my-5">
        <div class="display-1 mb-5">Meine Server</div>
        <v-divider></v-divider>
        <v-layout justify-center row class="my-8">
            <v-flex xs12 md4>
                <v-btn large outlined block color="success">Server erstellen</v-btn>
            </v-flex>
            <v-flex offset-xs-8 offset-md-6 xs1>
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn  v-on="on" icon color="info">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </template>
                    <span>Aktualisieren</span>
                </v-tooltip>
            </v-flex>
        </v-layout>

        <v-layout justify-center class="my-10">
            <v-flex xs12 md8 v-if="!userData.active">
                <v-alert outlined type="error" prominent border="left">
                    Um diese Seite aufzurufen musst du deine Email-Adresse bestätigen.
                    <br />Klicke dazu auf den Link, der dir zugesendet wurde.
                </v-alert>
            </v-flex>
            <v-flex xs12 md8 v-else>
                <v-card
                    :class="`mb-10 server ${server.online}`"
                    v-for="server in servers"
                    :key="server.name"
                >
                    <v-card-title>{{ server.name }}</v-card-title>
                    <v-card-text>
                        <v-layout class="px-3" row>
                            <v-flex xs12 md5>
                                <div class="caption">Hostname</div>
                                <div class="black--text">
                                    <span>{{ server.hostname }}</span>
                                    <v-icon
                                        small
                                        right
                                        @click="copyClipboard(server.hostname)"
                                    >mdi-clipboard-text-outline</v-icon>
                                </div>
                            </v-flex>
                            <v-flex xs6 md4>
                                <div class="caption">Spieler</div>
                                <div
                                    class="black--text"
                                >{{ server.online ? server.players : "-" }}/{{ server.online ? server.maxPlayers : "-" }}</div>
                            </v-flex>
                            <v-flex>
                                <div class="caption">Status</div>
                                <div v-if="server.online" class="green--text">Online</div>
                                <div v-else class="error--text">Offline</div>
                            </v-flex>
                            <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                    <v-btn @click="$router.push({path: server.name, append: true})" text icon v-on="on">
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

export default {
    data() {
        return {
            servers: [
                {
                    name: "Wincraft",
                    hostname: "wincraft.minecraftcloud.de",
                    online: true,
                    players: 12,
                    maxPlayers: 30
                },
                {
                    name: "Mineplex",
                    hostname: "mineplex.minecraftcloud.de",
                    online: true,
                    players: 105,
                    maxPlayers: 150
                },
                {
                    name: "Hypixel",
                    hostname: "hypixel.minecraftcloud.de",
                    online: false,
                    players: 0,
                    maxPlayers: 45
                }
            ]
        };
    },
    computed: {
        ...mapGetters(["userData"])
    },
    methods: {
        copyClipboard(toCopy) {
            navigator.clipboard.writeText(toCopy);
        }
    }
};
</script>

<style scoped>
.server.true {
    border-left: 4px solid #4caf50;
}
.server.false {
    border-left: 4px solid #ff5252;
}
</style>