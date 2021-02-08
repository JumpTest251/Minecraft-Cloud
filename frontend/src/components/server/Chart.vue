<template>
    <v-card class="mx-3 mt-5">
        <div id="chart">
            <apexchart
                type="area"
                height="350"
                :options="chartOptions"
                :series="series"
            ></apexchart>
        </div>
    </v-card>
</template>

<script>
import VueApexCharts from "vue-apexcharts";

export default {
    components: {
        apexchart: VueApexCharts,
    },
    props: ["series", "title", "yTitle"],
    data() {
        return {
            chartOptions: {
                chart: {
                    type: "area",
                    stacked: false,
                    height: 350,
                    zoom: {
                        type: "x",
                        enabled: true,
                        autoScaleYaxis: true,
                    },
                    toolbar: {
                        autoSelected: "zoom",
                    },
                    animations: {
                        enabled: false,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                markers: {
                    size: 0,
                },
                title: {
                    text: this.title,
                    align: "left",
                },

                yaxis: {
                    title: {
                        text: this.yTitle,
                    },
                },
                xaxis: {
                    type: "datetime",
                },
                tooltip: {
                    shared: false,
                },
                noData: {
                    text: "Loading...",
                },
            },
        };
    },
};
</script>