import { ServerPlan } from '../models/ServerPlan';
import { PricingDetails, PricingOption } from '../billing/pricing'
import { calculateHourlyCosts } from '../billing/costCalculator';
import { plans } from '@jumper251/core-module';

const pricingDetails1: PricingDetails = {
    cpu: 1,
    backups: {
        included: 1,
        modifier: 0.1
    },
    displayName: 'test1',
    memory: 1,
    storage: 1,
    traffic: 1,
    price: {
        hourly: 0.01,
        monthly: 7,
        pauseModifier: 0.2
    }
}

const pricingDetails2: PricingDetails = {
    ...pricingDetails1,
    backups: {
        included: 0,
        modifier: 0.1
    }
}

const pricingDetails3: PricingDetails = {
    ...pricingDetails1,
    monitoring: {
        standard: 2
    }
}

const pricingDetails4: PricingDetails = {
    ...pricingDetails1,
    monitoring: {
        advanced: 4
    }
}

const resources: plans.Plan = {
    backups: 1,
    memory: 1,
    analytics: plans.AnalyticsPlan.STANDARD
}

const resources2: plans.Plan = {
    backups: 0,
    memory: 1,
    analytics: plans.AnalyticsPlan.ADVANCED
}

const resources3: plans.Plan = {
    backups: 10,
    memory: 1,
    analytics: plans.AnalyticsPlan.ADVANCED
}


describe('Calculate hourly prices', () => {
    it('calculates the server costs', () => {
        const { serverCosts } = calculateHourlyCosts(resources, pricingDetails1);

        expect(serverCosts).toEqual(0.01);
    })

    it('calculates the totalCosts', () => {
        const { totalCosts: total1 } = calculateHourlyCosts(resources, pricingDetails1);
        const { totalCosts: total2 } = calculateHourlyCosts(resources, pricingDetails2);
        const { totalCosts: total3 } = calculateHourlyCosts(resources, pricingDetails3);
        const { totalCosts: total4 } = calculateHourlyCosts(resources2, pricingDetails1);
        const { totalCosts: total5 } = calculateHourlyCosts(resources3, pricingDetails4);

        expect(total1).toEqual(0.01);
        expect(total2).toEqual(0.011);
        expect(total3).toEqual(2.01);
        expect(total4).toEqual(0.01);
        expect(total5).toEqual(4.019);
    })

    it('calculates the totalCostsPaused', () => {
        const { totalCostsPaused: total1 } = calculateHourlyCosts(resources, pricingDetails1);
        const { totalCostsPaused: total2 } = calculateHourlyCosts(resources, pricingDetails2);
        const { totalCostsPaused: total3 } = calculateHourlyCosts(resources, pricingDetails3);
        const { totalCostsPaused: total4 } = calculateHourlyCosts(resources2, pricingDetails1);
        const { totalCostsPaused: total5 } = calculateHourlyCosts(resources3, pricingDetails4);

        expect(total1).toEqual(0.002);
        expect(total2).toEqual(0.003);
        expect(total3).toEqual(2.002);
        expect(total4).toEqual(0.002);
        expect(total5).toEqual(4.011);
    })
});

describe('ServerPlan calculations', () => {
    const getServerPlan = () => {
        return new ServerPlan({
            pricingPlan: PricingOption.Custom,
            pricingDetails: pricingDetails2,
            resources: resources,
            status: 'active'
        })
    }

    it('calculates hourly price when active', () => {
        const totalCosts = getServerPlan().hourlyCosts();

        expect(totalCosts).toEqual(0.011);
    })


    it('calculates hourly price when paused', () => {
        const serverPlan = getServerPlan();
        serverPlan.status = 'paused';
        const totalCosts = serverPlan.hourlyCosts();

        expect(totalCosts).toEqual(0.003);
    })

    it('calculates hourly price when type dynamic', () => {
        const serverPlan = getServerPlan();
        serverPlan.templateType = 'dynamic';
        const totalCosts = serverPlan.hourlyCosts();

        expect(totalCosts).toEqual(0.000);
    })

    it('calculates max price', () => {
        const maxCost = getServerPlan().monthlyMaxCosts();

        expect(maxCost).toEqual(7);
    })
});