import mongoose from 'mongoose';
import { PaymentMethod } from './types/payment'

export enum TransactionType {
    Payment = 'payment',
    Refund = 'refund',
    Prepay = 'prepay'
}

export enum TransactionState {
    Completed = 'completed',
    Refunded = 'refunded',
    Failed = 'failed'

}

export interface TransactionAttrs {
    paymentMethod: PaymentMethod,
    transactionType: TransactionType,
    state: TransactionState,
    transactionId: string,
    invoice?: string,
    customer: string,
    amount: number,
    details: {
        name: string,
        email?: string,
        currency?: string,
        address?: any,
        additionals?: any
    }

}

type TransactionDoc = mongoose.Document & TransactionAttrs;

const transactionSchema = new mongoose.Schema({
    paymentMethod: {
        type: String,
        required: true,
        enum: Object.values(PaymentMethod)
    },
    transactionType: {
        type: String,
        required: true,
        enum: Object.values(TransactionType)
    },
    state: {
        type: String,
        required: true,
        enum: Object.values(TransactionState)
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    invoice: mongoose.Schema.Types.ObjectId,
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    details: {
        name: String,
        email: String,
        currency: String,
        address: {},
        additionals: {}
    }
}, {
    timestamps: true
});

const TransactionModel = mongoose.model<TransactionDoc>('Transaction', transactionSchema);

export class Transaction extends TransactionModel {

    constructor(attrs: Partial<TransactionAttrs>) {
        super(attrs);
    }

    static createTransaction(options: TransactionAttrs) {
        const transaction = new Transaction(options);

        return transaction.save();
    }
}