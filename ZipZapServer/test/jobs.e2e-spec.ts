// test/jobs.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

describe('Jobs Module (e2e)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let user1Token: string; // Token for the user who will create the job
    let user2Token: string; // Token for a second user
    let jobId: string;      // The ID of the created job

    beforeAll(async () => {
        // Start an in-memory MongoDB instance.
        mongod = await MongoMemoryServer.create();
        process.env.MONGO_URI = mongod.getUri();

        // Explicitly connect before initializing the NestJS app
        await mongoose.connect(process.env.MONGO_URI, {});

        // Create the testing module using the real AppModule.
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // Enable global validation pipes (for DTOs).
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // Ensure the database is clean.
        const connection = mongoose.connection;
        await connection.dropDatabase();

        // --- Register two users for testing ---
        // Register user1 (will be the owner of the job).
        const user1Response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'User One',
                email: 'user1@test.com',
                password: 'password123',
            })
            .expect(201);
        user1Token = user1Response.body.access_token;

        // Register user2.
        const user2Response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'User Two',
                email: 'user2@test.com',
                password: 'password123',
            })
            .expect(201);
        user2Token = user2Response.body.access_token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await app.close();
        await mongod.stop();
    });

    it('should return an empty array when no jobs are posted', async () => {
        const res = await request(app.getHttpServer())
            .get('/jobs')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it('should not allow posting a job without authentication', async () => {
        await request(app.getHttpServer())
            .post('/jobs')
            .send({
                title: 'Unauthorized Job',
                description: 'Should not be posted',
            })
            .expect(401);
    });

    it('should allow an authenticated user (user1) to post a new job', async () => {
        const createJobDto = {
            title: 'Software Engineer',
            description: 'Develop cool features',
            location: 'Remote',
            salary: 120000,
        };

        const res = await request(app.getHttpServer())
            .post('/jobs')
            .set('Authorization', `Bearer ${user1Token}`)
            .send(createJobDto)
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('title', 'Software Engineer');
        expect(res.body).toHaveProperty('description', 'Develop cool features');
        expect(res.body).toHaveProperty('location', 'Remote');
        expect(res.body).toHaveProperty('salary', 120000);
        // Save the created job's ID for subsequent tests.
        jobId = res.body._id;
    });

    it('should retrieve all jobs (including the one posted)', async () => {
        const res = await request(app.getHttpServer())
            .get('/jobs')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
    });

    it('should allow the job owner (user1) to update the job', async () => {
        const updateJobDto = {
            title: 'Senior Software Engineer',
            description: 'Develop awesome features',
            location: 'Onsite',
            salary: 150000,
        };

        const res = await request(app.getHttpServer())
            .put(`/jobs/${jobId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(updateJobDto)
            .expect(200);

        expect(res.body).toHaveProperty('_id', jobId);
        expect(res.body).toHaveProperty('title', 'Senior Software Engineer');
        expect(res.body).toHaveProperty('description', 'Develop awesome features');
        expect(res.body).toHaveProperty('location', 'Onsite');
        expect(res.body).toHaveProperty('salary', 150000);
    });

    it('should not allow a non-owner (user2) to update the job', async () => {
        const updateJobDto = { title: 'Hacker Update' };

        await request(app.getHttpServer())
            .put(`/jobs/${jobId}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(updateJobDto)
            .expect(403);
    });

    it('should allow the job owner (user1) to delete the job', async () => {
        const res = await request(app.getHttpServer())
            .delete(`/jobs/${jobId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Job removed successfully');
    });

    it('should return 404 when trying to delete a non-existent job', async () => {
        await request(app.getHttpServer())
            .delete(`/jobs/${jobId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(404);
    });

    it('should not allow job deletion without authentication', async () => {
        await request(app.getHttpServer())
            .delete(`/jobs/${jobId}`)
            .expect(401);
    });
});
