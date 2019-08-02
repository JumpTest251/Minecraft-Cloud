<template>
    <v-dialog max-width="400px" v-model="dialog" persistent>
        <v-card>
            <v-card-title>
                <span class="headline">{{ title }}</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-layout row class="mt-6 mb-3">
                        <v-btn @click="$emit('popupConfirmed')" color="primary" text>Bestätigen</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click="$emit('popupCanceled')" color="error" text>Abrechen</v-btn>
                    </v-layout>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ["dialog", "title"]
};
</script>

