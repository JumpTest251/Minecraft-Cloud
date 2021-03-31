// @ts-ignore
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import paypal from './types/paypal';

import config from '../utils/config';
import { TransactionState } from '../models/Transaction';
import { PaymentMethod } from '../models/types/payment';

class PaypalProvider {
    private client: paypal.core.PayPalHttpClient;

    constructor() {
        this.client = new checkoutNodeJssdk.core.PayPalHttpClient(this.environment());
    }

    private environment(): paypal.core.PayPalEnvironment {
        const clientId = config.paypalClientId;
        const clientSecret = config.paypalClientSecret;

        return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
    }

    private liveEnvironment(): paypal.core.PayPalEnvironment {
        const clientId = config.paypalClientId;
        const clientSecret = config.paypalClientSecret;

        return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    }

    async captureOrder(orderId: string) {
        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId) as paypal.orders.OrdersCaptureRequest;
        request.requestBody({});
        // Request header to mock payment fail
        // request.headers['PayPal-Mock-Response'] = '{"mock_application_codes" : "INSTRUMENT_DECLINED"}'

        const { result } = await this.client.execute(request);

        return {
            transactionId: result.id,
            paymentMethod: PaymentMethod.Paypal,
            state: result.status === 'COMPLETED' ? TransactionState.Completed : TransactionState.Failed,
            amount: parseFloat(result.purchase_units[0].payments!.captures[0].amount.value),
            details: {
                name: `${result.payer?.name.given_name} ${result.payer?.name.surname}`,
                address: result.purchase_units[0].shipping?.address,
                email: result.payer?.email_address,
            }
        }
    }
}

export const paypalProvider = new PaypalProvider();