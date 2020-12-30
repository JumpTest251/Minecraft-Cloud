const permissions = {
    userLookup: 2,
    serverLookup: 2,
    serverUpdate: 5
}

const roleLevel = {
    User: 1,
    Staff: 2,
    Admin: 5,
    Service: 5
}

const roles = {
    User: "User",
    Staff: "Staff",
    Admin: "Admin",
    Service: "Service"
}

const accessPoints = {
    userLookup: 'userLookup',
    serverLookup: 'serverLookup',
    serverUpdate: 'serverUpdate'
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
module.exports.accessPoints = accessPoints;