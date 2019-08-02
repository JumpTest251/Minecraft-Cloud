<template>
    <v-snackbar top v-model="snackbar.active" :color="snackbar.color" :timeout="snackbar.timeout">
        {{ snackbar.content }}
        <v-btn dark text @click="removeSnackbar()">
            <v-icon>mdi-close</v-icon>
        </v-btn>
    </v-snackbar>
</template>

<script>
export default {
    data() {
        return {
            snackbar: this.$store.state.snackbar
        };
    },
    methods: {
        removeSnackbar() {
            this.$store.commit("updateSnackbar", { active: false });
        }
    }
};
</script>

