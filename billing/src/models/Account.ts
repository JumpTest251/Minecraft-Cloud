import mongoose from 'mongoose';
import Joi from 'joi';
import { CustomerAttrs } from './Customer'
import { PaymentMethod } from './types/payment';

export interface AccountAttrs {
    customer: CustomerAttrs | string,
    balance: number,
    monthlyUsage: number,
    limits: {
        servers: number,
        memory: number
    },
    paymentMethod?: {
        type: PaymentMethod,
        paymentEmail?: string,
        paymentAddress?: any,
        chargeable: any
    }
}

interface AccountDoc extends mongoose.Document, AccountAttrs {
    hasPaymentMethod: boolean
}

const accountSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        unique: true
    },
    balance: {
        type: Number,
        default: 0.0
    },
    monthlyUsage: {
        type: Number,
        default: 0.0
    },
    limits: {
        servers: {
            type: Number,
            default: 3
        },
        memory: {
            type: Number,
            default: 32
        }
    },
    paymentMethod: {}
}, {
    toJSON: {
        versionKey: false
    },

});

const AccountModel = mongoose.model<AccountDoc>('Account', accountSchema);

export class Account extends AccountModel {

    constructor(attrs: Partial<AccountAttrs>) {
        super(attrs);
    }

    get hasPaymentMethod() {
        return !!this.paymentMethod;
    }

    static createForCustomer(customerId: string) {
        const account = new Account({
            customer: customerId,
        })

        return account.save();
    }
}