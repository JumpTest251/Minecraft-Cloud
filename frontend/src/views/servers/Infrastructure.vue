<template>
    <v-container class="my-5">
        <div class="display-1 mb-5">Meine Infrastruktur</div>
        <v-divider></v-divider>
        <Alert
            v-if="infrastructure.length < 1 && !error"
            type="info"
            desc="Es wurden keine Server gefunden nutze Infrastruktur hinzufügen oder erstelle einen Verwalteten Server."
        />

        <Alert v-if="error" type="error" desc="Server konnten nicht geladen werden." />

        <v-layout justify-center class="my-10">
            <v-flex xs12 md8>
                <v-data-table
                    :headers="tableHead"
                    :items="infrastructure"
                    sort-by="name"
                    class="elevation-1"
                    :loading="deleting"
                >
                    <template v-slot:top>
                        <v-toolbar flat color="white">
                            <v-toolbar-title class="blue-grey--text">Infrastruktur</v-toolbar-title>
                            <v-divider class="mx-4" inset vertical></v-divider>
                            <v-spacer></v-spacer>
                            <v-dialog v-model="dialog" max-width="500px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-if="$vuetify.breakpoint.xsOnly"
                                        class="mx-2"
                                        fab
                                        small
                                        dark
                                        color="success"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <v-icon dark>mdi-plus</v-icon>
                                    </v-btn>
                                    <v-btn
                                        v-else
                                        color="success"
                                        outlined
                                        class="mb-2"
                                        v-bind="attrs"
                                        v-on="on"
                                    >Infrastruktur hinzufügen</v-btn>
                                </template>
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">{{ formTitle }}</span>
                                    </v-card-title>

                                    <v-card-text>
                                        <v-container>
                                            <v-form ref="form">
                                                <v-row>
                                                    <v-col cols="12" sm="6" md="6">
                                                        <v-text-field
                                                            v-model="editedItem.name"
                                                            label="Name"
                                                            :rules="nameRules"
                                                            :disabled="editedIndex > -1"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="6" md="6">
                                                        <v-text-field
                                                            v-model="editedItem.ip"
                                                            label="IP Adresse"
                                                            :rules="ipRules"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="12" md="12">
                                                        <v-text-field
                                                            v-model="editedItem.username"
                                                            label="Username"
                                                            :rules="usernameRules"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="12" md="12">
                                                        <v-textarea
                                                            rows="10"
                                                            v-model="editedItem.privateKey"
                                                            label="Private Key"
                                                            :rules="keyRules"
                                                        ></v-textarea>
                                                    </v-col>
                                                </v-row>
                                            </v-form>
                                        </v-container>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" text @click="close">Abbrechen</v-btn>
                                        <v-btn
                                            color="blue darken-1"
                                            :loading="loading"
                                            text
                                            @click="save"
                                        >Speichern</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                            <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                    <v-btn
                                        class="ml-7"
                                        @click="fetchServers(true)"
                                        v-on="on"
                                        icon
                                        color="info"
                                        :loading="reloading"
                                    >
                                        <v-icon>mdi-refresh</v-icon>
                                    </v-btn>
                                </template>
                                <span>Aktualisieren</span>
                            </v-tooltip>
                        </v-toolbar>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-icon
                            v-if="!item.managedId"
                            small
                            @click="edit(item)"
                            class="mr-2"
                            color="blue-grey"
                        >mdi-pencil</v-icon>
                        <v-icon
                            v-if="!item.managedId"
                            @click="confirming = true; deleteItem = item"
                            small
                            color="red"
                            loading
                        >mdi-delete</v-icon>

                        <span v-else>Managed Infrastructure</span>
                    </template>
                </v-data-table>
                <PopupConfirm
                    @popupConfirmed="deleteInfra()"
                    @popupCanceled="confirming = false"
                    :dialog="confirming"
                    :title="`${deleteItem.name} entfernen?`"
                />
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import Alert from "@/components/Alert";
import config from "@/config";
import PopupConfirm from "@/components/PopupConfirm";

export default {
    components: {
        Alert,
        PopupConfirm,
    },
    data() {
        return {
            dialog: false,
            error: false,
            deleteItem: {},
            deleting: false,
            confirming: false,
            reloading: true,
            loading: false,
            ipRules: [
                (v) => !!v || "IP darf nicht leer sein",
                (v) =>
                    /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(
                        v
                    ) || "Keine gültige IP Adresse",
            ],
            nameRules: [
                (v) => !!v || "Name darf nicht leer sein",
                (v) =>
                    (v && v.length >= 3 && v.length <= 40) ||
                    "Name muss zwischen 3 und 40 Zeichen haben",
            ],
            usernameRules: [
                (v) => !!v || "Username darf nicht leer sein",
                (v) => (v && v.length <= 400) || "Username ist zu lang",
            ],
            keyRules: [
                (v) => !!v || "Private Key darf nicht leer sein",
                (v) => (v && v.length <= 5000) || "Private Key ist zu lang",
            ],
            tableHead: [
                {
                    text: "Name",
                    align: "start",
                    value: "name",
                },
                { text: "IP Address", value: "ip" },
                { text: "Actions", value: "actions", sortable: false },
            ],
            editedIndex: -1,
            editedItem: {},
        };
    },
    computed: {
        ...mapGetters(["userData", "headers", "infrastructure"]),
        formTitle() {
            return this.editedIndex <= -1 ? "Hinzufügen" : "Bearbeiten";
        },
    },
    watch: {
        dialog(val) {
            val || this.close();
        },
    },
    mounted() {
        this.fetchServers();
    },
    methods: {
        async fetchServers(reloading = false) {
            this.reloading = reloading;
            this.error = await this.$store.dispatch(
                "fetchInfrastructure",
                this.$route.params.name
            );

            this.reloading = false;
        },
        async addInfrastructure() {
            try {
                const response = await this.$http.post(
                    `${config.serverServiceUrl}/infrastructure`,
                    {
                        name: this.editedItem.name,
                        ip: this.editedItem.ip,
                        username: this.editedItem.username,
                        privateKey: Buffer.from(
                            this.editedItem.privateKey
                        ).toString("base64"),
                    },
                    this.headers
                );
                this.$store.commit("addInfrastructure", response.data);
                this.$store.commit("updateSnackbar", {
                    active: true,
                    content: "Infrastruktur hinzugefügt",
                });
            } catch (ex) {
                this.$store.commit("updateSnackbar", {
                    active: true,
                    color: "error",
                    content: "Fehler: " + ex.response.data.error,
                });
            }
        },
        async updateInfrastructure() {
            try {
                await this.$http.put(
                    `${config.serverServiceUrl}/infrastructure/${this.$route.params.name}/${this.editedItem.name}`,
                    {
                        ip: this.editedItem.ip,
                        username: this.editedItem.username,
                        privateKey: Buffer.from(
                            this.editedItem.privateKey
                        ).toString("base64"),
                    },
                    this.headers
                );

                const removed = this.infrastructure.filter(
                    (item) => item.name !== this.editedItem.name
                );
                const updated = [...removed, this.editedItem];
                this.$store.commit("updateInfrastructure", updated);
                this.$store.commit("updateSnackbar", {
                    active: true,
                    content: "Infrastruktur erfolgreich aktualisiert",
                });
                // eslint-disable-next-line
            } catch (ex) {}
        },
        async deleteInfra() {
            this.deleting = true;
            this.confirming = false;

            try {
                await this.$http.delete(
                    `${config.serverServiceUrl}/infrastructure/${this.$route.params.name}/${this.deleteItem.name}`,
                    this.headers
                );

                const removed = this.infrastructure.filter(
                    (el) => el.name !== this.deleteItem.name
                );
                this.$store.commit("updateInfrastructure", removed);
            } catch (ex) {
                this.$store.commit("updateSnackbar", {
                    active: true,
                    color: "error",
                    content: "Fehler: " + ex.response.data.error,
                });
            }

            this.deleting = false;
        },
        edit(item) {
            this.editedIndex = this.infrastructure.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialog = true;
        },
        async save() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            if (this.editedIndex <= -1) {
                await this.addInfrastructure();
            } else {
                await this.updateInfrastructure();
            }

            this.loading = false;
            this.close();
        },
        close() {
            this.editedItem = {};
            this.dialog = false;
            this.editedIndex = -1;
            this.$refs.form.resetValidation();
        },
    },
};
</script>