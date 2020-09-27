<template>
    <v-container class="my-5">
        <v-layout justify-center class="my-10">
            <v-flex xs12 md8>
                <v-alert outlined :type="type" prominent border="left">
                    <p v-html="desc"></p>
                </v-alert>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
export default {
    props: ["type", "desc"],
};
</script>