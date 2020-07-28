<template>
    <v-flex xs12 md8>
        <v-card>
            <v-toolbar class="blue-grey" dark elevation="2">
                <v-toolbar-title>Dashboard</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon>
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text>
                <v-layout row>
                    <v-flex class="mx-3">
                        <v-card outlined>
                            <v-card-title>Allgemein</v-card-title>
                            <v-card-text>
                                <v-layout row class="ma-2">
                                    <v-flex>
                                        <div class="caption">Status</div>
                                        <div v-if="server.online" class="green--text">Online</div>
                                        <div v-else class="error--text">Offline</div>
                                    </v-flex>
                                    <v-spacer></v-spacer>
                                    <v-flex>
                                        <div class="caption">Spieler</div>
                                        <div
                                            class="black--text"
                                        >{{ server.online ? server.players : "-" }}/{{ server.online ? server.maxPlayers : "-" }}</div>
                                    </v-flex>
                                    <v-flex xs12>
                                        <div class="caption mt-5">Hostname</div>
                                        <div class="black--text">
                                            <span>{{ server.hostname }}</span>
                                        </div>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex class="mx-3">
                        <v-card outlined>
                            <v-card-title>Aktionen</v-card-title>
                            <v-card-text>
                                <v-layout class="ma-5" row>
                                    <v-btn v-if="!server.online" color="success">
                                        <v-icon left>mdi-power</v-icon>Start
                                    </v-btn>
                                    <v-btn v-else color="error">
                                        <v-icon left>mdi-power</v-icon>Stop
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn color="warning">
                                        <v-icon left>mdi-restart</v-icon>Neustart
                                    </v-btn>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
export default {
    data() {
        return {
            server: {
                online: true,
                name: "Wincraft",
                hostname: "wincraft.minecraftcloud.de",
                players: 3,
                maxPlayers: 10
            }
        };
    }
};
</script>