import request from 'supertest';
import { app } from '../../app';
import { authManager } from '@jumper251/core-module';
import { Customer } from '../../models/Customer';
import { Account } from '../../models/Account';
import axios from 'axios';
import mongoose from 'mongoose';

const userId = new mongoose.Types.ObjectId().toHexString();

const validInput = {
    firstName: 'Anton',
    lastName: 'Müller',
    address: {
        street: 'street',
        zipCode: '21149',
        city: 'city',
        country: 'de'
    }
}

const createCustomer = () => {
    const customer = new Customer({
        _id: userId,
        firstName: validInput.firstName,
        lastName: validInput.lastName,
        email: 'test@test.de',
        address: {
            street: validInput.address.street,
            zipCode: validInput.address.zipCode,
            city: validInput.address.city,
            country: validInput.address.country
        }
    });

    return customer.save();
}

describe('Create a Customer', () => {
    const axiosMock = {
        _id: userId,
        email: 'test@test.de'
    }

    it('returns 401 if unauthenticated', async () => {
        await request(app)
            .post('/customers')
            .send({})
            .expect(401)
    });

    it('returns 403 if not active', async () => {
        await request(app)
            .post('/customers')
            .set('Authorization', global.signin({
                active: false,
                roles: [authManager.Role.User],
                username: 'abcd'
            }))
            .send({})
            .expect(403)
    });

    it('returns 400 with invalid input', async () => {
        await request(app)
            .post('/customers')
            .set('Authorization', global.signin())
            .send({ firstName: '@' })
            .expect(400)
    })

    it('returns 400 if Customer exists', async () => {
        // @ts-ignore
        axios.get.mockReturnValue(Promise.resolve({
            data: axiosMock
        }));

        await createCustomer();

        await request(app)
            .post('/customers')
            .set('Authorization', global.signin())
            .send(validInput)
            .expect(400)
    })

    it('creates a Customer and Account with valid input', async () => {
        await request(app)
            .post('/customers')
            .set('Authorization', global.signin())
            .send(validInput)
            .expect(201)

        const customer = await Customer.findById(userId);
        expect(customer).not.toBeNull();
        expect(customer!.firstName).toEqual(validInput.firstName);
        // @ts-ignore
        expect(customer!.address.toJSON()).toEqual(validInput.address);

        const account = await Account.findOne({ customer: customer!._id });
        expect(account).not.toBeNull();
        expect(account!.balance).toEqual(0);
        expect(account!.monthlyUsage).toEqual(0);
        expect(account!.limits.servers).toEqual(3);
        expect(account!.limits.memory).toEqual(32);
    })
});



describe('Update a Customer', () => {
    it('returns 401 if unauthenticated', async () => {
        await request(app)
            .put(`/customers/${userId}`)
            .send(validInput)
            .expect(401)
    });

    it('returns 403 if access denied', async () => {
        await request(app)
            .put(`/customers/${userId}`)
            .set('Authorization', global.signin())
            .send(validInput)
            .expect(403)
    })

    it('returns 404 if Customer not found', async () => {
        await request(app)
            .put(`/customers/${new mongoose.Types.ObjectId().toHexString()}`)
            .set('Authorization', global.signinAdmin())
            .send(validInput)
            .expect(404)
    })

    it('returns 400 with invalid input', async () => {
        await request(app)
            .put(`/customers/${userId}`)
            .set('Authorization', global.signin(undefined, userId))
            .send({ firstName: '@' })
            .expect(400)

        await request(app)
            .put(`/customers/${userId}`)
            .set('Authorization', global.signin(undefined, userId))
            .send({ ...validInput, phone: -1 })
            .expect(400)
    })

    it('updates the Customer with valid input', async () => {
        await createCustomer();

        await request(app)
            .put(`/customers/${userId}`)
            .set('Authorization', global.signin(undefined, userId))
            .send({ ...validInput, firstName: 'NewName' })
            .expect(200)

        const customer = await Customer.findById(userId);
        expect(customer).not.toBeNull();
        expect(customer!.lastName).toEqual(validInput.lastName);
        expect(customer!.firstName).toEqual('NewName');
    })
});

describe('Get a Customer', () => {
    it('returns 401 if unauthenticated', async () => {
        await request(app)
            .get(`/customers/${userId}`)
            .send()
            .expect(401)
    });

    it('returns 403 if access denied', async () => {
        await request(app)
            .get(`/customers/${userId}`)
            .set('Authorization', global.signin())
            .send()
            .expect(403)
    })

    it('returns 404 if Customer not found', async () => {
        await request(app)
            .get(`/customers/${new mongoose.Types.ObjectId().toHexString()}`)
            .set('Authorization', global.signinAdmin())
            .send()
            .expect(404)
    })

    it('returns the Customer if found', async () => {
        await createCustomer();

        const customer = await request(app)
            .get(`/customers/${userId}`)
            .set('Authorization', global.signin(undefined, userId))
            .send()
            .expect(200)

        expect(customer).not.toBeNull();
        expect(customer.body).toBeDefined();
        expect(customer.body.firstName).toEqual(validInput.firstName);
        expect(customer.body.lastName).toEqual(validInput.lastName);
        expect(customer.body.address).toEqual(validInput.address);
    })
});
