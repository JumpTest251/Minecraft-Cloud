<template>
    <v-app>
        <Snackbar />
        <Navbar />

        <v-content class="mx-4 mb-3" v-if="$route.path !== '/'">
            <router-view></router-view>
        </v-content>
        
        <v-content v-else>
            <router-view></router-view>
        </v-content>

        <v-footer>
            <v-spacer></v-spacer>
            <div>&copy; 2020</div>
        </v-footer>
    </v-app>
</template>

<script>
import Navbar from "@/components/Navbar";
import Snackbar from "@/components/Snackbar";

export default {
    data() {
        return {
            refreshing: false,
        };
    },
    components: {
        Navbar,
        Snackbar,
    },
};
</script>
