<template>
    <v-container class="my-5">
        <div class="display-1 mb-5">Zugriff Verweigert</div>
        <v-divider></v-divider>
        <Alert
            type="error"
            desc="Um diese Seite aufzurufen musst du deine Email-Adresse bestätigen.
                    <br />Klicke dazu auf den Link, der dir zugesendet wurde."
        />
    </v-container>
</template>

<script>
import Alert from "@/components/Alert";

export default {
    components: {
        Alert,
    },
};
</script>