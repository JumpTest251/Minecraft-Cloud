const permissions = {
    "userLookup": 2
}

const roleLevel = {
    "User" : 1,
    "Staff": 2,
    "Admin": 5,
    "Service": 5
}

module.exports.canAccess = function(user, accessPoint) {
    return new Promise((resolve, reject) => {
        const neededPoints = permissions[accessPoint];

        user.roles.forEach(role => {
            if (roleLevel[role] >= neededPoints) resolve(true);
        });
    
        return resolve(false);
    });

}