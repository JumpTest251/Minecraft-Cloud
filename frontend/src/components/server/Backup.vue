<template>
    <v-flex xs12 md8>

    </v-flex>
</template>

<script>
import { mapGetters } from "vuex";
import config from "@/config";

export default {
    data() {
        return {};
    },
    computed: {
        ...mapGetters(["userData", "server", "headers"]),
    },
    mounted() {},
    methods: {},
};
</script>
