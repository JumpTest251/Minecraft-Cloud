import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Account } from '../../models/Account';
import { Transaction, TransactionState } from '../../models/Transaction';

const customerId = new mongoose.Types.ObjectId().toHexString();

const createAccount = () => {
    return Account.createForCustomer(customerId);
}

describe('Make a paypal payment', () => {
    it('returns 401 if unauthenticated', async () => {
        await request(app)
            .post(`/payments/${customerId}/paypal`)
            .send()
            .expect(401)
    });

    it('returns 403 if account does not belong to customer', async () => {
        await createAccount();

        await request(app)
            .post(`/payments/${customerId}/paypal`)
            .set('Authorization', global.signin())
            .send()
            .expect(403)
    });

    it('returns 404 if account does not exist', async () => {
        await request(app)
            .post(`/payments/${customerId}/paypal`)
            .set('Authorization', global.signin())
            .send()
            .expect(404)
    });

    it('returns 400 if invalid order', async () => {
        await createAccount();

        await request(app)
            .post(`/payments/${customerId}/paypal`)
            .set('Authorization', global.signin(undefined, customerId))
            .send({ orderId: 'fail' })
            .expect(400)

        const account = await Account.findOne({ customer: customerId });
        const transaction = await Transaction.findOne({ transactionId: 'fail' });
        expect(account).not.toBeNull();
        expect(transaction).toBeNull();

        expect(account!.balance).toEqual(0);

    });

    it('returns 200 and processes payment if valid', async () => {
        await createAccount();

        await request(app)
            .post(`/payments/${customerId}/paypal`)
            .set('Authorization', global.signin(undefined, customerId))
            .send({ orderId: 'abc' })
            .expect(200)

        const transaction = await Transaction.findOne({ transactionId: 'abc' });
        const account = await Account.findOne({ customer: customerId });

        expect(transaction).not.toBeNull();
        expect(account).not.toBeNull();
        // @ts-ignore
        expect(transaction!.customer.toHexString()).toEqual(customerId);
        expect(transaction!.state).toEqual(TransactionState.Completed);
        expect(transaction!.amount).toEqual(5);
        expect(transaction!.details.name).toEqual('Test');
        expect(transaction!.details.email).toEqual('test@test.de');

        expect(account!.balance).toEqual(5);
    });
});