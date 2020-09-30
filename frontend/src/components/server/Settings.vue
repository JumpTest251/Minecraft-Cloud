<template>
    <v-flex xs12 md8>
        <v-card>
            <v-toolbar class="blue-grey" dark elevation="2">
                <v-toolbar-title>Einstellungen</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-layout row>
                    <v-flex
                        :class="[
                            $vuetify.breakpoint.xsOnly ? '' : 'mx-3',
                            'mb-1',
                        ]"
                    >
                        <v-card flat>
                            <v-card-text>
                                <v-form ref="form">
                                    <v-row>
                                        <v-col cols="12" class="my-10" sm="6">
                                            <v-text-field
                                                type="number"
                                                prepend-icon="mdi-memory"
                                                v-if="
                                                    server.provider === 'custom'
                                                "
                                                v-model="memory"
                                                label="Arbeitsspeicher (MB)"
                                                hint="Beachte die Angabe erfolgt in Megabyte"
                                                :rules="notEmpty"
                                            ></v-text-field>

                                            <v-select
                                                prepend-icon="mdi-memory"
                                                v-else
                                                v-model="memory"
                                                :items="managedMemory"
                                                label="Arbeitsspeicher"
                                                hint="Der Arbeitsspeicher kann nicht mehr verringert werden"
                                                persistent-hint
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="12" class="my-10" sm="6">
                                            <v-text-field
                                                class="ml-5"
                                                type="number"
                                                prepend-icon="mdi-lan"
                                                v-model="port"
                                                label="Port"
                                                max="65535"
                                                hint="25565 wird als Standard festgelegt"
                                                persistent-hint
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="12" class="my-10" sm="6">
                                            <v-select
                                                prepend-icon="mdi-zip-box"
                                                v-model="serverType"
                                                :items="software"
                                                label="Server Software"
                                                hint="Bei Custom muss eine eigene jar hochgeladen werden"
                                                persistent-hint
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="12" class="my-10" sm="6">
                                            <v-autocomplete
                                                prepend-icon="mdi-file-code"
                                                v-model="version"
                                                :items="versions"
                                                :disabled="
                                                    server.serverType ===
                                                    'Custom'
                                                "
                                                label="Minecraft Version"
                                                hint="Die Version kann jederzeit geändert werden"
                                                persistent-hint
                                            ></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" class="my-10" sm="12">
                                            <v-text-field
                                                v-model="image"
                                                label="Docker Image"
                                                placeholder="itzg/minecraft-server"
                                                prepend-icon="mdi-docker"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-form>
                            </v-card-text>
                            <v-divider class="my-3"></v-divider>
                            <v-card-actions>
                                <v-btn
                                    @click="confirming = true"
                                    :loading="deleting"
                                    outlined
                                    color="error"
                                    >Server Löschen</v-btn
                                >
                                <v-spacer></v-spacer>
                                <v-btn
                                    @click="updateServer"
                                    :loading="loading"
                                    :disabled="!changed"
                                    outlined
                                    color="blue-grey"
                                    >Speichern</v-btn
                                >
                            </v-card-actions>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <PopupConfirm
            @popupConfirmed="deleteServer()"
            @popupCanceled="confirming = false"
            :dialog="confirming"
            title="Möchtest du den Server wirklich löschen?"
        />
    </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import config from "@/config";
import PopupConfirm from "@/components/PopupConfirm";

export default {
    components: {
        PopupConfirm,
    },
    data() {
        return {
            version: "",
            memory: null,
            port: null,
            image: "",
            serverType: "",
            loading: false,
            deleting: false,
            confirming: false,
            software: this.$store.state.minecraft.software,
            versions: this.$store.state.minecraft.versions.slice().reverse(),
            notEmpty: this.$store.state.globalRules.notEmpty,
            managedMemory: [
                ...this.$store.state.minecraft.managedMemory,
            ].map((a) => ({ ...a })),
        };
    },
    computed: {
        ...mapGetters(["userData", "server", "headers"]),
        changed() {
            return (
                this.version !== this.server.version ||
                this.memory != this.server.memory ||
                this.port != this.server.port ||
                (this.image && this.image !== this.server.image) ||
                this.serverType.toLowerCase() !== this.server.serverType
            );
        },
    },
    mounted() {
        this.version = this.server.version;
        this.memory = this.server.memory;
        this.port = this.server.port;
        if (this.server.serverType) {
            this.serverType =
                this.server.serverType.charAt(0).toUpperCase() +
                this.server.serverType.slice(1);
        }
        this.image = this.server.image;

        this.managedMemory.forEach((el, index) => {
            if (el.value < this.memory) {
                this.managedMemory[index] = this.managedMemory[
                    index
                ].disabled = true;
            }
        });
    },
    methods: {
        async updateServer() {
            if (!this.$refs.form.validate()) return;
            if (!this.changed) return;

            this.loading = true;

            const update = {};
            if (this.version) update.version = this.version;
            if (this.memory) update.memory = this.memory;
            if (this.port) update.port = this.port;
            if (this.serverType)
                update.serverType = this.serverType.toLowerCase();
            if (this.image) update.image = this.image;

            try {
                await this.$http.put(
                    `${config.serverServiceUrl}/servers/${this.$route.params.name}/${this.$route.params.server}`,
                    update,
                    this.headers
                );
                this.$store.commit("updateSnackbar", {
                    active: true,
                    timeout: 8000,
                    content:
                        "Server wurde erfolgreich aktualisiert. Einige Änderungen können erst nach einem Neustart bzw. nach einer Pausierung aktiv werden.",
                });

                this.$store.dispatch("fetchServer", {
                    username: this.$route.params.name,
                    server: this.$route.params.server,
                });
            } catch (ex) {
                this.$store.commit("updateSnackbar", {
                    active: true,
                    color: "error",
                    content: "Fehler: " + ex.response.data.error,
                });
            }

            this.loading = false;
        },
        async deleteServer() {
            this.deleting = true;
            this.confirming = false;
            try {
                await this.$http.delete(
                    `${config.serverServiceUrl}/servers/${this.$route.params.name}/${this.$route.params.server}`,
                    this.headers
                );

                this.$store.commit("updateSnackbar", {
                    active: true,
                    content: "Server wurde entfernt.",
                });

                this.$router.push(`/servers/${this.$route.params.name}`);
            } catch (ex) {
                this.$store.commit("updateSnackbar", {
                    active: true,
                    color: "error",
                    content: "Fehler: " + ex.response.data.error,
                });

                this.deleting = false;
            }
        },
    },
};
</script>
