export interface TokenUser {
    roles: Role[],
    type?: String,
    active: boolean,
    username: string
}

export enum Role {
    User = "User",
    Staff = "Staff",
    Admin = "Admin",
    Service = "Service"
}

export enum Permission {
    UserLooup = 2,
    ServerLookup = 2,
    ServerUpdate = 5
}


export interface Identity {
    requested?: string,
    actual?: string
}

const roleLevel = {
    User: 1,
    Staff: 2,
    Admin: 5,
    Service: 5
}

export function canAccess(user: TokenUser, accessPoint: Permission, identity: Identity = {}): Promise<boolean> {
    return new Promise(resolve => {

        if (identity.requested && identity.requested === identity.actual) resolve(true);

        user.roles.forEach(role => {
            if (roleLevel[role] >= accessPoint) return resolve(true);
        });

        return resolve(false);
    });

}
