<template>
    <v-app>
        <Snackbar />
        <Navbar />

        <v-content class="mx-4 mb-3">
            <router-view></router-view>
        </v-content>

        <v-footer>
            <v-spacer></v-spacer>
            <div>&copy; 2019</div>
        </v-footer>
    </v-app>
</template>

<script>
import Navbar from "@/components/Navbar";
import Snackbar from "@/components/Snackbar"

export default {
    name: "App",
    components: {
        Navbar,
        Snackbar
    },
    data: () => ({
        //
    })
};
</script>
