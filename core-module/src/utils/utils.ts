const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);


export async function randomString(length: number) {
    const token = await randomBytes(length);

    return token.toString('hex');
}