const mongoose = require('mongoose');
const User = require("./User");

const chars = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"];

const userTokenSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    token: {
        type: String,
        default: () => {
            return [...Array(40)].map(i => chars[Math.random() * chars.length|0]).join``;
        },
        unique: true
    },
    createdAt: {
        type: Date,
        expires: '10m',
        default: Date.now
    }
});

userTokenSchema.statics.generateToken = async function(user) {
    const dbUser = await User.findOne().or([{ name : user.name }, { email: user.email }]).select("name");

    if (dbUser) {
        const dbToken = await UserToken.findOne({ user: dbUser.name });
        if (dbToken) return;

        const token = new UserToken({ user: dbUser.name })
        await token.save();
        
        return token;
    }
}

const UserToken = mongoose.model('UserToken', userTokenSchema);

module.exports = UserToken;