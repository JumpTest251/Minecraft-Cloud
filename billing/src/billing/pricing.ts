import { plans } from '@jumper251/core-module'

export enum PricingOption {
    Default2GbV1 = "default2gbv1",
    Default4GbV1 = "default4gbv1",
    Default8GbV1 = "default8gbv1",
    Default16GbV1 = "default16gbv1",
    Default32GbV1 = "default32gbv1",
    CustomHardwarev1 = "customHardwarev1",
    Custom = "custom"
}

export interface PricingDetails {
    displayName: string,
    memory: number,
    storage: number,
    cpu: number,
    traffic: number,
    price: {
        hourly: number,
        monthly: number,
        pauseModifier: number
    },
    backups: {
        included: number,
        modifier: number,
    },
    monitoring?: Partial<Record<plans.AnalyticsPlan, number>>
}




// Default options
const backupOptions = {
    included: 1,
    modifier: 0.1
}
const pauseModifier = 0.2;



const defaultPricingDetails: Record<Exclude<PricingOption, PricingOption.Custom>, PricingDetails> = {
    "default2gbv1": {
        displayName: '2 GB',
        memory: 2,
        storage: 20,
        cpu: 1,
        traffic: 20000,
        price: {
            hourly: 0.01,
            monthly: 7.5,
            pauseModifier
        },
        backups: backupOptions,
    },
    "default4gbv1": {
        displayName: '4 GB',
        memory: 4,
        storage: 40,
        cpu: 2,
        traffic: 20000,
        price: {
            hourly: 0.02,
            monthly: 15,
            pauseModifier
        },
        backups: backupOptions
    },
    "default8gbv1": {
        displayName: '8 GB',
        memory: 8,
        storage: 80,
        cpu: 2,
        traffic: 20000,
        price: {
            hourly: 0.04,
            monthly: 30,
            pauseModifier
        },
        backups: backupOptions
    },
    "default16gbv1": {
        displayName: '16 GB',
        memory: 16,
        storage: 160,
        cpu: 4,
        traffic: 20000,
        price: {
            hourly: 0.08,
            monthly: 60,
            pauseModifier
        },
        backups: backupOptions
    },
    "default32gbv1": {
        displayName: '32 GB',
        memory: 32,
        storage: 240,
        cpu: 8,
        traffic: 20000,
        price: {
            hourly: 0.16,
            monthly: 110,
            pauseModifier
        },
        backups: backupOptions
    },
    "customHardwarev1": {
        displayName: 'Custom Server',
        memory: -1,
        storage: -1,
        cpu: -1,
        traffic: -1,
        price: {
            hourly: 0.0,
            monthly: 0.0,
            pauseModifier: 0.0
        },
        backups: {
            included: 0,
            modifier: 1
        }
    },

}

export const findByMemory = (memory: number, provider?: string): [string, PricingDetails] | null => {
    if (provider === 'custom') {
        return [PricingOption.CustomHardwarev1, defaultPricingDetails.customHardwarev1];
    }

    const entry = Object.entries(defaultPricingDetails).find(([option, details]) => details.memory === memory);
    if (!entry) {
        return null;
    }

    return entry;
}

export const findPricingDetails = (option: PricingOption): PricingDetails | null => {
    if (option === PricingOption.Custom) {
        return null;
    }

    return defaultPricingDetails[option];
}

export { defaultPricingDetails }


