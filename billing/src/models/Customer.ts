import mongoose from 'mongoose';
import Joi from 'joi';

interface CustomerAttrs {
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    address: {
        street: string,
        zip: string,
        city: string,
        country: string
    },
    phone?: string
}

type CustomerDoc = mongoose.Document & CustomerAttrs;

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        street: String,
        zip: String,
        city: String,
        country: String
    },
    phone: String

})

const CustomerModel = mongoose.model<CustomerDoc>('Customer', customerSchema);

export class Customer extends CustomerModel {
    constructor(attrs: CustomerAttrs) {
        super(attrs);
    }

    static checkValid(customer: Partial<CustomerAttrs>) {
        const joiName = Joi.string().trim().min(1).max(50).regex(/^[\p{L}'][ \p{L}'-]*[\p{L}]$/u).required();

        return Joi.object({
            firstName: joiName,
            lastName: joiName,
            address: Joi.object({
                street: Joi.string().trim().min(1).max(50).required(),
                zipCode: Joi.string().trim().min(1).max(12).required(),
                city: Joi.string().trim().min(1).max(50).required(),
                country: Joi.string().trim().length(2).required()
            }).required(),
            phone: Joi.string().trim().min(6).max(15)
        }).validateAsync(customer);
    }
}
