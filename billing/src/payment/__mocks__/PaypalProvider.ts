import { PaymentDetails } from '../PaymentService';
import { PaymentMethod } from '../../models/types/payment'
import { TransactionState } from '../../models/Transaction'

export const paypalProvider = {
    captureOrder: jest.fn().mockImplementation(async (orderId: string) => {
        if (orderId === 'fail') {
            throw new Error(JSON.stringify({
                details: [
                    {
                        issue: 'ISSUE'
                    }
                ]
            }));
        }

        const paymentInfo: PaymentDetails = {
            amount: 5,
            paymentMethod: PaymentMethod.Paypal,
            details: {
                name: 'Test',
                email: 'test@test.de',
                address: {},
            },
            state: TransactionState.Completed,
            transactionId: orderId,
        }

        return paymentInfo;
    })
}