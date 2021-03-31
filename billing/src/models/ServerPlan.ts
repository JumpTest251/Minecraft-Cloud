import mongoose from 'mongoose';
import { ServerCreatedEvent, plans } from '@jumper251/core-module'
import { PricingOption, PricingDetails, findPricingDetails } from '../billing/pricing';
import { calculateHourlyCosts } from '../billing/costCalculator';

export interface ServerPlanAttrs {
    _id: string,
    resources: plans.Plan,
    customer: string,
    status: 'active' | 'paused',
    provider: 'custom' | 'hetzner' | 'digitalocean',
    pricingPlan: PricingOption,
    pricingDetails?: PricingDetails
    templateType: 'static' | 'dynamic',
    usage: {
        hours: number,
        pausedHours: number,
        lastUsageReport?: number
    },
    lastBilled?: Date
}

interface ServerPlanDoc extends mongoose.Document, Omit<ServerPlanAttrs, '_id'> {
    hourlyCosts(ignorePaused: boolean): number,
    monthlyMaxCosts(): number
}

const serverPlanSchema = new mongoose.Schema({
    resources: {},
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    pricingPlan: {
        type: String,
        required: true
    },
    pricingDetails: {},
    templateType: {
        type: String,
        required: true
    },
    usage: {
        hours: {
            type: Number,
            default: 0
        },
        pausedHours: {
            type: Number,
            default: 0
        },
        lastUsageReport: Number
    },
    lastBilled: Date

}, {
    timestamps: true,

});

const ServerPlanModel = mongoose.model<ServerPlanDoc>('ServerPlan', serverPlanSchema);

export class ServerPlan extends ServerPlanModel {

    constructor(attrs: Partial<ServerPlanAttrs>) {
        super(attrs);
    }

    hourlyCosts(ignorePaused = false) {
        const {
            totalCosts,
            totalCostsPaused,
            analyticsPlanCosts,
        } = calculateHourlyCosts(this.resources, this.getPricingDetails());


        if (this.status === 'paused' && !ignorePaused) return totalCostsPaused;
        if (this.templateType === 'dynamic') return analyticsPlanCosts;

        return totalCosts;
    }

    monthlyMaxCosts() {
        return this.getPricingDetails().price.monthly;
    }

    getPricingDetails() {
        return this.pricingDetails || findPricingDetails(this.pricingPlan)!;
    }

    static fromEvent(event: ServerCreatedEvent) {
    }

    static async findByCustomer(customer: string): Promise<ServerPlan[]> {
        return (await ServerPlan.find({ customer })) as ServerPlan[];
    }
}