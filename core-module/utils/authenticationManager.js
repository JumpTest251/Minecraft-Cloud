const permissions = {
    userLookup: 2,
    serverLookup: 2,
    serverUpdate: 5
}

const roleLevel = {
    user: 1,
    staff: 2,
    admin: 5,
    service: 5
}

const roles = {
    user: "User",
    staff: "Staff",
    admin: "Admin",
    service: "Service"
}

module.exports.canAccess = function (user, accessPoint, identity = {}) {
    return new Promise(resolve => {
        const neededPoints = permissions[accessPoint];

        if (identity.requested && identity.requested === identity.actual) resolve(true);

        user.roles.forEach(role => {
            if (roleLevel[role] >= neededPoints) resolve(true);
        });

        return resolve(false);
    });

}

module.exports.permissions = permissions;
module.exports.roles = roles;
module.exports.roleLevel = roleLevel;