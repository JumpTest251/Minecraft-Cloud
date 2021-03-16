<template>
    <v-container class="my-5">
        <div class="display-1 mb-5">Server erstellen</div>
        <v-divider></v-divider>
        <v-layout justify-center class="my-10">
            <v-flex xs12 sm8 md8 lg8 xl6>
                <v-stepper v-model="step">
                    <v-stepper-header>
                        <v-stepper-step :complete="step > 1" step="1"
                            >Namen festlegen</v-stepper-step
                        >

                        <v-divider></v-divider>

                        <v-stepper-step :complete="step > 2" step="2"
                            >Konfiguration</v-stepper-step
                        >

                        <v-divider></v-divider>

                        <v-stepper-step step="3"
                            >Erweiterte Einstellungen</v-stepper-step
                        >
                    </v-stepper-header>

                    <v-stepper-items>
                        <v-stepper-content step="1">
                            <v-form ref="formName">
                                <v-text-field
                                    v-model="name"
                                    :rules="nameRules"
                                    class="my-10"
                                    @keypress.enter.prevent
                                    label="Server Name"
                                    prepend-icon="mdi-tag-text"
                                ></v-text-field>
                            </v-form>
                            <v-layout justify-center>
                                <v-btn disabled text>Zurück</v-btn>
                                <v-spacer></v-spacer>

                                <v-btn
                                    dark
                                    color="blue-grey"
                                    :loading="loading"
                                    @click="goNext"
                                    >Weiter</v-btn
                                >
                            </v-layout>
                        </v-stepper-content>

                        <v-stepper-content step="2">
                            <v-form ref="form2">
                                <v-select
                                    class="my-5"
                                    v-model="templateType"
                                    :items="templateTypes"
                                    label="Server Typ"
                                    hint="Wähle aus welche Art von Server du erstellen willst"
                                    prepend-icon="mdi-tune-vertical"
                                    :rules="notEmpty"
                                    persistent-hint
                                ></v-select>
                                <v-select
                                    class="my-8"
                                    :items="providerList"
                                    v-model="provider"
                                    label="Anbieter"
                                    hint="Wähle aus, wo dein Server erstellt werden soll"
                                    :rules="notEmpty"
                                    prepend-icon="mdi-server-network"
                                    persistent-hint
                                ></v-select>

                                <div class="my-10" v-if="provider === 'custom'">
                                    <v-divider class="my-5"></v-divider>
                                    <h4 class="mt-2 mb-5 blue-grey--text">
                                        Infrastruktur angeben
                                    </h4>

                                    <v-autocomplete
                                        v-model="infrastructureId"
                                        :items="infrastructureComplete"
                                        label="Name der Infrastruktur"
                                        :rules="notEmpty"
                                        prepend-icon="mdi-database-search"
                                    ></v-autocomplete>
                                </div>
                            </v-form>
                            <v-layout justify-center>
                                <v-btn @click="step = 1" text>Zurück</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn dark color="blue-grey" @click="goNext"
                                    >Weiter</v-btn
                                >
                            </v-layout>
                        </v-stepper-content>

                        <v-stepper-content step="3">
                            <!-- <v-card class="mb-12" color="grey lighten-1" height="200px"></v-card> -->
                            <v-form ref="form3">
                                <v-row>
                                    <v-col cols="12" class="my-10" sm="6">
                                        <v-text-field
                                            type="number"
                                            prepend-icon="mdi-memory"
                                            v-if="provider === 'custom'"
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
                                            hint="Der Arbeitsspeicher kann später nicht verringert werden"
                                            persistent-hint
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="12" class="my-10" sm="6">
                                        <v-text-field
                                            class="ml-5"
                                            type="number"
                                            prepend-icon="mdi-lan"
                                            v-model="port"
                                            label="Port (Optional)"
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
                                            :disabled="serverType === 'Custom'"
                                            label="Minecraft Version"
                                            hint="Die Version kann jederzeit geändert werden"
                                            persistent-hint
                                        ></v-autocomplete>
                                    </v-col>
                                    <v-col
                                        v-if="templateType === 'dynamic'"
                                        cols="12"
                                        class="my-10"
                                        sm="12"
                                    >
                                        <v-text-field
                                            v-model="image"
                                            label="Docker Image (Optional)"
                                            placeholder="itzg/minecraft-server"
                                            prepend-icon="mdi-docker"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-form>
                            <v-layout justify-center>
                                <v-btn @click="step = 2" text>Zurück</v-btn>
                                <v-spacer></v-spacer>

                                <v-btn
                                    dark
                                    color="blue-grey"
                                    :loading="loading"
                                    @click="createServer"
                                    >Erstellen</v-btn
                                >
                            </v-layout>
                        </v-stepper-content>
                    </v-stepper-items>
                </v-stepper>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import config from "@/config";
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            step: 1,
            name: "",
            templateType: "static",
            provider: "hetzner",
            memory: 1024,
            port: null,
            infrastructureId: "",
            version: "1.12.2",
            image: "",
            serverType: "Spigot",
            loading: false,
            error: "",
            managedMemory: this.$store.state.minecraft.managedMemory,
            templateTypes: [
                { text: "Statisch", value: "static" },
                { text: "Dynamisch", value: "dynamic" },
            ],
            providerList: [
                { text: "Managed", value: "hetzner" },
                { text: "Eigene Infrastruktur", value: "custom" },
            ],
            software: this.$store.state.minecraft.software,
            versions: this.$store.state.minecraft.versions.slice().reverse(),
            nameRules: [
                (v) => !!v || "Name darf nicht leer sein",
                (v) =>
                    !this.error ||
                    this.error.data.name.toLowerCase() != v.toLowerCase() ||
                    "Name wird bereits verwendet",

                (v) =>
                    (v && v.length >= 4 && v.length <= 30) ||
                    "Name muss zwischen 4 und 30 Zeichen haben",
                (v) => /^[\w]+$/.test(v) || "Name enthält unerlaubte Zeichen",
            ],
            notEmpty: this.$store.state.globalRules.notEmpty,
        };
    },
    computed: {
        ...mapGetters(["userData", "headers", "infrastructure"]),
        infrastructureComplete() {
            return this.infrastructure
                .filter((el) => !el.managedId)
                .map((el) => ({
                    text: el.name,
                    value: el._id,
                }));
        },
    },
    mounted() {
        this.$store.dispatch("fetchInfrastructure", this.userData.username);
    },
    methods: {
        async createServer() {
            this.loading = true;

            const server = {
                name: this.name,
                createdBy: this.userData.username,
                templateType: this.templateType,
                memory: this.memory,
                provider: this.provider,
                version: this.version,
                serverType: this.serverType.toLowerCase(),
            };
            if (this.port) server.port = this.port;
            if (this.image) server.image = this.image;
            if (this.infrastructureId && this.provider === "custom")
                server.infrastructure = this.infrastructureId;

            try {
                await this.$http.post(
                    `${config.serverServiceUrl}/servers`,
                    server,
                    this.headers
                );

                this.$store.commit("updateSnackbar", {
                    active: true,
                    content: "Server wurde erfolgreich erstellt.",
                });
                this.$router.push(`/servers/${this.userData.username}`);
            } catch (ex) {
                this.$store.commit("updateSnackbar", {
                    active: true,
                    color: "error",
                    content: "Fehler: " + ex.response.data.error,
                });
            }
            this.loading = false;
        },
        async goNext() {
            if (this.step === 1) {
                if (!this.$refs.formName.validate()) return;

                const exists = await this.verifyName();
                this.error = exists;
                if (exists) {
                    this.$refs.formName.validate();
                    return;
                }
                this.step = 2;
            } else if (this.step === 2) {
                if (!this.$refs.form2.validate()) return;
                this.step = 3;
            }
        },
        async verifyName() {
            this.loading = true;
            try {
                const result = await this.$http.get(
                    `${config.serverServiceUrl}/servers/${this.userData.username}/${this.name}`,
                    this.headers
                );
                this.loading = false;

                return result;
            } catch (ex) {
                this.loading = false;
            }
        },
    },
};
</script>
