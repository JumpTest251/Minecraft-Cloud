import { Plan } from '../types/plans';

export type EventData =
    | UserUpdatedEvent
    | ServerCreatedEvent
    | ServerPausedEvent
    | ServerUnpausedEvent
    | ServerDeletedEvent
    | InsufficientBalanceEvent
    | BalanceUpdatedEvent


export interface UserUpdatedEvent {
    userId: string,
    email: string,
    version: number

}

export interface ServerCreatedEvent {
    serverId: string,
    userId: string,
    createdAt: number,
    serverPlan: Plan,
    provider: string,
    templateType: string
}

export interface ServerPausedEvent {
    serverId: string
}

export interface ServerUnpausedEvent {
    serverId: string,
    serverPlan: Plan,
    provider: string,
    templateType: string
}

export interface ServerDeletedEvent {
    serverId: string,
    time: number

}

export interface InsufficientBalanceEvent {
    userId: string,
    balance: number
}

export interface BalanceUpdatedEvent {
    userId: string,
    balance: number,
    version: number
}