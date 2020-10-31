<template>
    <v-main fluid class="my-0 pt-0">
        <section>
            <v-parallax src="@/assets/landing.png" height="600">
                <v-layout
                    column
                    align-center
                    justify-center
                    class="white--text"
                >
                    <h1
                        class="white--text mb-2 display-1 text-xs-center text-center"
                        style="font-weight: 900; text-shadow: 3px 2px #000000"
                    >
                        Minecraft Server in der Cloud
                    </h1>
                    <div
                        class="white--text subheading mb-3 text-xs-center text-center"
                        style="font-weight: 900; text-shadow: 2px 2px #000000"
                    ></div>
                    <v-btn
                        class="green lighten-2 mt-5"
                        dark
                        large
                        router
                        :to="!loggedIn ? '/register' : `/servers/${userData.username}`"
                        >Get Started</v-btn
                    >
                </v-layout>
            </v-parallax>
        </section>

        <section>
            <v-layout column wrap class="my-5" align-center>
                <v-flex xs12>
                    <v-container grid-list-xl>
                        <v-layout row wrap align-center>
                            <v-flex xs12 md4>
                                <v-card class="elevation-0 transparent">
                                    <v-card-text
                                        class="text-xs-center text-center"
                                    >
                                        <v-icon
                                            x-large
                                            class="green--text text--lighten-2"
                                            >mdi-view-dashboard</v-icon
                                        >
                                    </v-card-text>
                                    <v-card-title
                                        primary-title
                                        class="layout justify-center"
                                    >
                                        <div
                                            class="headline text-xs-center text-center"
                                        >
                                            Web Interface
                                        </div>
                                    </v-card-title>
                                    <v-card-text class="text-center my-5"
                                        >Das Web Interface ermöglicht es dir,
                                        alle wichtigen Operationen schnell und
                                        übersichtlich auszuführen.</v-card-text
                                    >
                                </v-card>
                            </v-flex>
                            <v-flex xs12 md4>
                                <v-card class="elevation-0 transparent">
                                    <v-card-text
                                        class="text-xs-center text-center"
                                    >
                                        <v-icon
                                            x-large
                                            class="green--text text--lighten-2"
                                            >mdi-flash</v-icon
                                        >
                                    </v-card-text>
                                    <v-card-title
                                        primary-title
                                        class="layout justify-center"
                                    >
                                        <div class="headline">
                                            Schnelle Einrichtung
                                        </div>
                                    </v-card-title>
                                    <v-card-text class="text-center my-5"
                                        >Erstelle deinen eigenen Minecraft
                                        Server in unter 60 Sekunden</v-card-text
                                    >
                                </v-card>
                            </v-flex>
                            <v-flex xs12 md4>
                                <v-card class="elevation-0 transparent">
                                    <v-card-text
                                        class="text-xs-center text-center"
                                    >
                                        <v-icon
                                            x-large
                                            class="green--text text--lighten-2"
                                            >mdi-trending-up</v-icon
                                        >
                                    </v-card-text>
                                    <v-card-title
                                        primary-title
                                        class="layout justify-center"
                                    >
                                        <div class="headline text-xs-center">
                                            Einfach Skalieren
                                        </div>
                                    </v-card-title>
                                    <v-card-text class="text-center my-5">
                                        Stundengenaue Abrechnung ermöglicht es,
                                        einfach die Resourcen an deine
                                        Spielerzahl anzupassen.
                                    </v-card-text>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-flex>
            </v-layout>
        </section>

        <section>
            <v-parallax src="@/assets/darksmall.png" height="380">
                <v-layout column align-center justify-center>
                    <div
                        class="headline white--text mb-3 text-xs-center text-center"
                    >
                        Mit MinecraftCloud kannst du Minecraft Server in der
                        Cloud oder auf eigener Hardware erstellen.
                    </div>
                    <em class="text-center"
                        >Alle gängigen Serverversionen und Serversoftware Arten
                        können automatisch installiert werden</em
                    >
                    <v-btn
                        class="green lighten-2 mt-5"
                        dark
                        large
                        router
                        to="/register"
                        >Registrieren</v-btn
                    >
                </v-layout>
            </v-parallax>
        </section>

        <section>
            <v-container grid-list-md>
                <v-layout row wrap>
                    <v-flex xs12 text-xs-center class="mt-5">
                        <div class="headline">Newsletter</div>
                        <br />
                        <div></div>
                    </v-flex>
                    <v-flex xs8 offset-xs2>
                        <v-card class="elevation-0 transparent">
                            <v-card-text>
                                <v-flex xs12 v-if="!subscribed">
                                    <v-text-field
                                        filled
                                        label="Email Adresse"
                                        :rules="emailRules"
                                        v-model="email"
                                        hint="Gib eine Email an"
                                        persistent-hint
                                    ></v-text-field>
                                </v-flex>

                                <v-flex
                                    xs12
                                    class="text-xs-center text-center"
                                    v-if="!subscribed"
                                >
                                    <v-btn
                                        class="green lighten-2 mb-5"
                                        dark
                                        large
                                        @click="subscribe"
                                        >Anmelden</v-btn
                                    >
                                </v-flex>
                                <v-flex
                                    xs12
                                    class="text-xs-center text-center"
                                    v-if="subscribed"
                                >
                                    <v-btn
                                        class="green lighten-2 mb-5"
                                        dark
                                        large
                                        >Willkommen!</v-btn
                                    >
                                </v-flex>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </section>

        <section>
            <v-parallax src="@/assets/chickenmc.png" height="380">
                <v-layout column align-center justify-center>
                    <div
                        class="headline white--text mb-3 text-xs-center text-center"
                    >
                        Nichts verpassen und immer aktuell bleiben
                    </div>
                </v-layout>
                <v-layout justify-space-around justify-center>
                    <v-icon x-large dark>mdi-twitter</v-icon>

                    <v-icon x-large dark>mdi-reddit</v-icon>

                    <v-icon x-large dark>mdi-discord</v-icon>

                    <v-icon x-large dark>mdi-instagram</v-icon>
                </v-layout>
            </v-parallax>
        </section>

        <section>
            <v-container grid-list-xl>
                <v-layout row wrap justify-center class="my-5">
                    <v-flex xs12 sm4>
                        <v-card class="elevation-0 transparent">
                            <v-card-title
                                primary-title
                                class="layout justify-center"
                            >
                                <div class="headline">MinecraftCloud</div>
                            </v-card-title>
                            <v-card-text></v-card-text>
                        </v-card>
                    </v-flex>
                    <!--<v-flex xs12 sm4 offset-sm1>
                        <v-card class="elevation-0 transparent">
                            <v-card-title
                                primary-title
                                class="layout justify-center"
                            >
                                <div class="headline">We are hiring</div>
                            </v-card-title>
                            <v-card-text></v-card-text>
                        </v-card>
                    </v-flex> -->
                </v-layout>
            </v-container>
        </section>
    </v-main>
</template>

<script>
import { mapGetters } from "vuex";


export default {
    data() {
        return {
            email: "",
            emailRules: [
                (v) => {
                    return !!v || "E-mail is required";
                },
                (v) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
                    "E-mail must be valid",
            ],
            subscribed: false,
        };
    },
    methods: {
        subscribe() {
            this.subscribed = !this.subscribed;
        },
    },

    computed: {
        ...mapGetters(["loggedIn", "userData"]),
        imgHeight() {
            var offset = 320;
            return this.pageHeight - offset;
        },
    },

    mounted() {},
};
</script>

<style scoped>
.finedTitle {
    font-weight: 900;
    text-shadow: 2px 2px #000000;
}

.social-icon {
    font-size: 21px;
    color: rgb(26, 180, 47);
}
</style>





