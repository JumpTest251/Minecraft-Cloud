import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
process.env.JWT_PRIVATE_KEY = '1234';

import { tokenGenerator, authManager } from '@jumper251/core-module';
import { TokenUser } from '@jumper251/core-module/build/auth/authenticationManager';

declare global {
    namespace NodeJS {
        interface Global {
            signin(user?: TokenUser): string;
            signinAdmin(): string;
        }
    }
}

let mongo: any;

beforeAll(async () => {
    mongo = new MongoMemoryServer();
    const url = await mongo.getUri();

    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true
    })
})

beforeEach(async () => {
    jest.clearAllMocks();

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
})

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
})

global.signin = (user?: TokenUser) => {
    const tokenUser: TokenUser = user || {
        active: true,
        roles: [authManager.Role.User],
        username: 'Jumper251',
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    return `Bearer ${tokenGenerator.generateToken(tokenUser)}`;
}

global.signinAdmin = () => {
    return global.signin({
        active: true,
        roles: [authManager.Role.Admin],
        username: 'Admin1',
        userId: new mongoose.Types.ObjectId().toHexString()
    })
}