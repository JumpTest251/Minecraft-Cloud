import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { plans } from '@jumper251/core-module';
import { PricingOption } from '../../billing/pricing';

import { createAccount, customerId } from '../testHelper';

const validInput = {
    resources: {
        memory: 2,
        backups: 1,
        analyticsPlan: plans.AnalyticsPlan.STANDARD
    },
    provider: 'hetzner',

}

const invalidPlan = {
    resources: {
        memory: 128,
        backups: 1,
        analyticsPlan: plans.AnalyticsPlan.STANDARD
    },
    provider: 'hetzner',

}

describe('Get Account information', () => {
    it('returns 401 if unauthenticated', async () => {
        await request(app)
            .post(`/accounts/${customerId}`)
            .send()
            .expect(401)
    });

    it('returns 403 if access denied', async () => {
        await request(app)
            .get(`/accounts/${customerId}`)
            .set('Authorization', global.signin())
            .send(validInput)
            .expect(403)
    })

    it('returns 404 if Account not found', async () => {
        await request(app)
            .get(`/accounts/${new mongoose.Types.ObjectId().toHexString()}`)
            .set('Authorization', global.signinAdmin())
            .send()
            .expect(404)
    })

    it('returns Account if found', async () => {
        await createAccount(0);

        const account = await request(app)
            .get(`/accounts/${customerId}`)
            .set('Authorization', global.signin(undefined, customerId))
            .send()
            .expect(200)

        expect(account).not.toBeNull();
        expect(account.body).toBeDefined();
        expect(account.body.limits).toBeDefined();
        expect(account.body.balance).toEqual(0);
    })

});

describe('Authorize a Plan', () => {
    it('returns 401 if unauthenticated', async () => {
        await request(app)
            .post(`/accounts/${customerId}/authorize`)
            .send()
            .expect(401)
    });

    it('returns 403 if access denied', async () => {
        await request(app)
            .post(`/accounts/${customerId}/authorize`)
            .set('Authorization', global.signin())
            .send(validInput)
            .expect(403)
    })

    it('returns 404 if account not found', async () => {
        await request(app)
            .post(`/accounts/${customerId}/authorize`)
            .set('Authorization', global.signin(undefined, customerId))
            .send(validInput)
            .expect(404)
    });

    it('returns 400 with invalid input', async () => {
        await createAccount();

        const { body } = await request(app)
            .post(`/accounts/${customerId}/authorize`)
            .set('Authorization', global.signin(undefined, customerId))
            .send({})
            .expect(400)

        expect(body.error).toContain('required');
    });


    it('returns 400 with invalid plan', async () => {
        await createAccount();

        const { body } = await request(app)
            .post(`/accounts/${customerId}/authorize`)
            .set('Authorization', global.signin(undefined, customerId))
            .send(invalidPlan)
            .expect(400)

        expect(body.error).toContain('plan');
    });

    it('returns 400 if authorization fails', async () => {
        await createAccount(0);

        const { body } = await request(app)
            .post(`/accounts/${customerId}/authorize`)
            .set('Authorization', global.signin(undefined, customerId))
            .send(validInput)
            .expect(400)

        expect(body.error).toContain('Insufficient');
    });

    it('returns 200 if authorization succeeds', async () => {
        await createAccount(1);

        const { body } = await request(app)
            .post(`/accounts/${customerId}/authorize`)
            .set('Authorization', global.signin(undefined, customerId))
            .send(validInput)
            .expect(200)

        expect(body).toBeDefined();
        expect(body.authorized).toEqual(PricingOption.Default2GbV1);
    });

});