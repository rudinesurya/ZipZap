import * as request from 'supertest';
import { E2ETestBase } from './base.e2e';

describe('Ratings Module (e2e)', () => {
    let testBase: E2ETestBase;
    let user1Token: string; // Token for the rater
    let user2Token: string; // Token for the rated user (used to get profile)
    let user2Id: string;    // The _id of the rated user
    let ratingId: string;   // The rating created by user1 for user2

    beforeAll(async () => {
        testBase = new E2ETestBase();
        await testBase.setup();

        // --- Create two users via the /auth/register endpoint ---
        // User 1 (the rater)
        const user1Response = await request(testBase.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'User One',
                email: 'user1@test.com',
                password: 'password',
            })
            .expect(201);
        user1Token = user1Response.body.access_token;

        // User 2 (the rated user)
        const user2Response = await request(testBase.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'User Two',
                email: 'user2@test.com',
                password: 'password',
            })
            .expect(201);
        user2Token = user2Response.body.access_token;

        // Retrieve user2's profile to obtain the _id
        const user2ProfileResponse = await request(testBase.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${user2Token}`)
            .expect(200);
        user2Id = user2ProfileResponse.body._id;
    });

    afterAll(async () => {
        await testBase.teardown();
    });

    it('should create a rating for user2 by user1', async () => {
        const createRatingDto = { rating: 4, comment: 'Great transaction!' };

        const res = await request(testBase.getHttpServer())
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

        const res = await request(testBase.getHttpServer())
            .post(`/ratings/user/${user2Id}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(createRatingDto)
            .expect(403);

        expect(res.body.message).toContain('already rated');
    });

    it('should update the rating for user2 by user1', async () => {
        const updateRatingDto = { rating: 5, comment: 'Updated comment' };

        const res = await request(testBase.getHttpServer())
            .put(`/ratings/${ratingId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(updateRatingDto)
            .expect(200);

        expect(res.body.rating).toEqual(5);
        expect(res.body.comment).toEqual('Updated comment');
    });

    it('should retrieve ratings for user2', async () => {
        const res = await request(testBase.getHttpServer())
            .get(`/ratings/user/${user2Id}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        // Ensure the rater information is populated (e.g., name and email)
        expect(res.body[0].rater).toHaveProperty('name');
        expect(res.body[0].rater).toHaveProperty('email');
    });

    it('should delete the rating by user1', async () => {
        const res = await request(testBase.getHttpServer())
            .delete(`/ratings/${ratingId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);

        expect(res.body.message).toEqual('Rating removed successfully');

        // Confirm that no ratings exist for user2 after deletion
        const getRes = await request(testBase.getHttpServer())
            .get(`/ratings/user/${user2Id}`)
            .expect(200);
        expect(getRes.body.length).toEqual(0);
    });
});
