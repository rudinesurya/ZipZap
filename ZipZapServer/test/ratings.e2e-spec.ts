import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { AppModule } from 'src/app.module';

describe('Ratings Module (e2e)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let user1Token: string; // Token for the rater
    let user2Token: string; // Token for the rated user (used to get profile)
    let user2Id: string;    // The _id of the rated user
    let ratingId: string;   // The rating created by user1 for user2

    beforeAll(async () => {
        // Start in-memory MongoDB instance
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        // Override the connection string via environment variable.
        // (Ensure your AppModule uses process.env.MONGO_URI in MongooseModule.forRoot.)
        process.env.MONGO_URI = uri;

        // Explicitly connect before initializing the NestJS app
        await mongoose.connect(process.env.MONGO_URI, {});

        // Create the testing module using the full AppModule.
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        // Enable global validation for DTOs
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // Drop the in-memory database (in case previous tests left any data)
        const connection = mongoose.connection;
        await connection.dropDatabase();

        // --- Create two users via the /auth/register endpoint ---
        // User 1 (the rater)
        const user1Response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'User One',
                email: 'user1@test.com',
                password: 'password',
            })
            .expect(201);
        user1Token = user1Response.body.access_token;

        // User 2 (the rated user)
        const user2Response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'User Two',
                email: 'user2@test.com',
                password: 'password',
            })
            .expect(201);
        user2Token = user2Response.body.access_token;

        // Retrieve user2's profile to obtain the _id
        const user2ProfileResponse = await request(app.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(200);
        user2Id = user2ProfileResponse.body._id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await app.close();
        await mongod.stop();
    });

    it('should create a rating for user2 by user1', async () => {
        const createRatingDto = { rating: 4, comment: 'Great transaction!' };

        const res = await request(app.getHttpServer())
            .post(`/ratings/user/${user2Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(createRatingDto)
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body.rating).toEqual(4);
        expect(res.body.comment).toEqual('Great transaction!');
        expect(res.body.ratedUser).toEqual(user2Id);
        // Save the rating id for later tests
        ratingId = res.body._id;
    });

    it('should not allow duplicate rating creation by the same user', async () => {
        const createRatingDto = { rating: 5, comment: 'Another rating' };

        const res = await request(app.getHttpServer())
            .post(`/ratings/user/${user2Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(createRatingDto)
            .expect(403);

        expect(res.body.message).toContain('already rated');
    });

    it('should update the rating for user2 by user1', async () => {
        const updateRatingDto = { rating: 5, comment: 'Updated comment' };

        const res = await request(app.getHttpServer())
            .put(`/ratings/${ratingId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(updateRatingDto)
            .expect(200);

        expect(res.body.rating).toEqual(5);
        expect(res.body.comment).toEqual('Updated comment');
    });

    it('should retrieve ratings for user2', async () => {
        const res = await request(app.getHttpServer())
            .get(`/ratings/user/${user2Id}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        // Ensure the rater information is populated (e.g., name and email)
        expect(res.body[0].rater).toHaveProperty('name');
        expect(res.body[0].rater).toHaveProperty('email');
    });

    it('should delete the rating by user1', async () => {
        const res = await request(app.getHttpServer())
            .delete(`/ratings/${ratingId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);

        expect(res.body.message).toEqual('Rating removed successfully');

        // Confirm that no ratings exist for user2 after deletion
        const getRes = await request(app.getHttpServer())
            .get(`/ratings/user/${user2Id}`)
            .expect(200);
        expect(getRes.body.length).toEqual(0);
    });
});
