<template>
    <div ref="paypal"></div>
</template>

<script>
import { mapGetters } from "vuex";
import config from "@/config";

export default {
    props: ["amount"],
    data() {
        return {};
    },
    mounted() {
        const script = document.createElement("script");
        script.src =
            "https://www.paypal.com/sdk/js?client-id=ASMRi4CkMcgcmQpuBnJzoDA-SyjgQ3TbITqnwyzrtT95pq-ri7xZSKblBj2pxDSPCHVwdOmAWh8eOOVq&currency=EUR";
        script.addEventListener("load", this.setLoaded);
        document.body.appendChild(script);
    },
    computed: {
        ...mapGetters(["userData", "headers"]),
    },
    methods: {
        setLoaded() {
            window.paypal
                .Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    description: `Prepaid - ${this.userData.userId}`,
                                    amount: {
                                        value: this.amount,
                                        currency_code: "EUR",
                                    },
                                },
                            ],
                        });
                    },

                    onApprove: async (data) => {
                        try {
                            await this.$http.post(
                                `${config.billingServiceUrl}/payments/${this.userData.userId}/paypal`,
                                {
                                    orderId: data.orderID,
                                },
                                this.headers
                            );
                            this.$emit("paymentCompleted");
                            
                        } catch (error) {
                            this.$emit("paymentFailed", error);
                        }
                    },
                    onError: (error) => {
                        this.$emit("paymentFailed", error);
                    },
                })
                .render(this.$refs.paypal);
        },
    },
};
</script>