// test/users.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

describe('Users Module (e2e)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let userToken: string;
    let userId: string; // We'll extract this from the profile response

    beforeAll(async () => {
        // Start an in-memory MongoDB instance.
        mongod = await MongoMemoryServer.create();
        process.env.MONGO_URI = mongod.getUri();

        // Explicitly connect before initializing the NestJS app
        await mongoose.connect(process.env.MONGO_URI, {});

        // Create testing module using the AppModule.
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // Enable global validation for DTOs.
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // Ensure the in-memory database is clean.
        const connection = mongoose.connection;
        await connection.dropDatabase();

        // Register a user for testing.
        const registerResponse = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123',
            })
            .expect(201);

        expect(registerResponse.body).toHaveProperty('access_token');
        userToken = registerResponse.body.access_token;

        // Retrieve the user's profile to obtain the user ID.
        const profileResponse = await request(app.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(profileResponse.body).toHaveProperty('_id');
        userId = profileResponse.body._id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await app.close();
        await mongod.stop();
    });

    it('should retrieve the authenticated user profile', async () => {
        const res = await request(app.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        // Verify that the returned profile has the expected properties.
        expect(res.body).toHaveProperty('_id', userId);
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
        expect(res.body).toHaveProperty('name', 'Test User');
    });

    it('should update user settings using PUT /users/settings', async () => {
        // Prepare new settings to update (for example, updating the name).
        const updateSettingsDto = { name: 'Updated Test User' };

        const res = await request(app.getHttpServer())
            .put('/users/settings')
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateSettingsDto)
            .expect(200);

        // Verify that the updated profile reflects the new settings.
        expect(res.body).toHaveProperty('_id', userId);
        expect(res.body).toHaveProperty('name', 'Updated Test User');
        // The email should remain unchanged.
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
    });

    it('should deny access to profile without token', async () => {
        await request(app.getHttpServer())
            .get('/users/profile')
            .expect(401);
    });

    it('should deny updating settings without token', async () => {
        await request(app.getHttpServer())
            .put('/users/settings')
            .send({ name: 'Hacker' })
            .expect(401);
    });
});
