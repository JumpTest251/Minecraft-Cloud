export enum AnalyticsPlan {
    STANDARD = 'standard',
    ADVANCED = 'advanced'
}

export interface Plan {
    memory: number,
    backups: number,
    analytics: AnalyticsPlan
}