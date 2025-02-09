import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

describe('Auth Module (e2e)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let userToken: string;

    beforeAll(async () => {
        // Start an in-memory MongoDB instance
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        // Override the connection string for testing
        process.env.MONGO_URI = uri;

        // Explicitly connect before initializing the NestJS app
        await mongoose.connect(process.env.MONGO_URI, {});

        // Create testing module using the real AppModule
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe()); // Enable validation globally
        await app.init();

        // Drop the in-memory database before starting
        const connection = mongoose.connection;
        await connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await app.close();
        await mongod.stop();
    });

    it('should register a new user', async () => {
        const registerDto = {
            name: 'John Doe',
            email: 'john@test.com',
            password: 'password123',
        };

        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send(registerDto)
            .expect(201);

        expect(res.body).toHaveProperty('access_token');
        userToken = res.body.access_token; // Save token for later tests
    });

    it('should not allow duplicate registration with the same email', async () => {
        const duplicateUserDto = {
            name: 'John Doe',
            email: 'john@test.com',
            password: 'password123',
        };

        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send(duplicateUserDto)
            .expect(400);

        expect(res.body.message).toContain('Email already in use');
    });

    it('should login an existing user', async () => {
        const loginDto = {
            email: 'john@test.com',
            password: 'password123',
        };

        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginDto)
            .expect(200);

        expect(res.body).toHaveProperty('access_token');
        userToken = res.body.access_token; // Store token for later tests
    });

    it('should not allow login with incorrect password', async () => {
        const invalidLoginDto = {
            email: 'john@test.com',
            password: 'wrongpassword',
        };

        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send(invalidLoginDto)
            .expect(401);

        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should retrieve user profile with valid JWT', async () => {
        const res = await request(app.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('email', 'john@test.com');
        expect(res.body).toHaveProperty('name', 'John Doe');
    });

    it('should deny access to profile without token', async () => {
        await request(app.getHttpServer())
            .get('/users/profile')
            .expect(401);
    });

    it('should deny access to profile with an invalid token', async () => {
        await request(app.getHttpServer())
            .get('/users/profile')
            .set('Authorization', 'Bearer invalid_token')
            .expect(401);
    });
});
