<template>
    <v-snackbar
        top
        v-model="snackbar.active"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
    >
        <v-layout align-center>
            {{ snackbar.content }}

            <v-flex class="text-right">
                <v-btn dark text @click="removeSnackbar()">
                    <v-icon right>mdi-close</v-icon>
                </v-btn>
            </v-flex>
        </v-layout>
    </v-snackbar>
</template>

<script>
export default {
    data() {
        return {
            snackbar: this.$store.state.snackbar,
        };
    },
    methods: {
        removeSnackbar() {
            this.$store.commit("updateSnackbar", { active: false });
        },
    },
};
</script>

