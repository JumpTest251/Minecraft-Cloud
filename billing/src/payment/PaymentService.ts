import { Transaction, TransactionAttrs, TransactionState, TransactionType } from '../models/Transaction';
import { Account } from '../models/Account';
import { Optional } from '../utils/typeUtils';

export type PaymentDetails = Optional<TransactionAttrs, | 'customer' | 'invoice' | 'transactionType'>

export class PaymentService {

    private account: Account;

    constructor(account: Account) {
        this.account = account;
    }

    processPayment() {

    }

    async processPrepay(paymentDetails: PaymentDetails) {
        if (paymentDetails.state === TransactionState.Completed) {
            await Account.updateOne({ customer: this.account.customer }, {
                $inc: {
                    balance: paymentDetails.amount
                }
            })
        }

        return this.finish(TransactionType.Prepay, paymentDetails);
    }

    private finish(type: TransactionType, transaction: PaymentDetails) {
        return Transaction.createTransaction({
            customer: this.account.customer as string,
            transactionType: type,
            ...transaction
        });
    }
}
