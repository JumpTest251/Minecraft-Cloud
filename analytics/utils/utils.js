const chars = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"];


module.exports.randomString = function(length) {
    return [...Array(length)].map(i => chars[Math.random() * chars.length|0]).join``;
}
