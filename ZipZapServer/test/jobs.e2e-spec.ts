import * as request from 'supertest';
import { E2ETestBase } from './base.e2e';

describe('Jobs Module (e2e)', () => {
    let testBase: E2ETestBase;
    let user1Token: string; // Token for the user who will create the job
    let user2Token: string; // Token for a second user
    let jobId: string;      // The ID of the created job

    beforeAll(async () => {
        testBase = new E2ETestBase();
        await testBase.setup();

        // --- Register two users for testing ---
        // Register user1 (will be the owner of the job).
        const user1Response = await request(testBase.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'User One',
                email: 'user1@test.com',
                password: 'password123',
            })
            .expect(201);
        user1Token = user1Response.body.access_token;

        // Register user2.
        const user2Response = await request(testBase.getHttpServer())
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
        await testBase.teardown();
    });

    it('should return an empty array when no jobs are posted', async () => {
        const res = await request(testBase.getHttpServer())
            .get('/jobs')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    it('should not allow posting a job without authentication', async () => {
        await request(testBase.getHttpServer())
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
            location: {
                formattedAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
                placeId: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
                lat: 37.4221,
                lng: -122.0841,
            },
            salary: 120000,
        };

        const res = await request(testBase.getHttpServer())
            .post('/jobs')
            .set('Authorization', `Bearer ${user1Token}`)
            .send(createJobDto)
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('title', 'Software Engineer');
        expect(res.body).toHaveProperty('description', 'Develop cool features');
        expect(res.body).toHaveProperty('salary', 120000);

        expect(res.body).toHaveProperty('location');
        const location = res.body.location;
        expect(location).toHaveProperty('formattedAddress', '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA');
        expect(location).toHaveProperty('placeId', 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA');
        expect(location).toHaveProperty('lat', 37.4221);
        expect(location).toHaveProperty('lng', -122.0841);
        
        // Save the created job's ID for subsequent tests.
        jobId = res.body._id;
    });

    it('should retrieve all jobs (including the one posted)', async () => {
        const res = await request(testBase.getHttpServer())
            .get('/jobs')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
    });

    it('should retrieve a job posting by its valid ID', async () => {
        const res = await request(testBase.getHttpServer())
            .get(`/jobs/${jobId}`)
            .expect(200);

        // Validate that the response contains the expected job properties.
        expect(res.body).toHaveProperty('_id', jobId);
        expect(res.body).toHaveProperty('title', 'Software Engineer');
        expect(res.body).toHaveProperty('description', 'Develop cool features');
        expect(res.body).toHaveProperty('salary', 120000);

        expect(res.body).toHaveProperty('location');
        const location = res.body.location;
        expect(location).toHaveProperty('formattedAddress', '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA');
        expect(location).toHaveProperty('placeId', 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA');
        expect(location).toHaveProperty('lat', 37.4221);
        expect(location).toHaveProperty('lng', -122.0841);
    });

    it('should return 404 when retrieving a job posting with a non-existent ID', async () => {
        // Use a valid ObjectId format that is not present in the database.
        const nonExistentId = '614c1b2f3f9a2e001a1a2b3c';
        await request(testBase.getHttpServer())
            .get(`/jobs/${nonExistentId}`)
            .expect(404);
    });

    it('should allow the job owner (user1) to update the job', async () => {
        const updateJobDto = {
            title: 'Senior Software Engineer',
            description: 'Develop awesome features',
            location: {
                formattedAddress: '1 Infinite Loop, Cupertino, CA 95014, USA',
                placeId: 'ChIJ-3aBaiV2j4ARxBYw-DyWc1I',
                lat: 37.33182,
                lng: -122.03118,
            },
            salary: 150000,
        };

        const res = await request(testBase.getHttpServer())
            .put(`/jobs/${jobId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .send(updateJobDto)
            .expect(200);

        expect(res.body).toHaveProperty('_id', jobId);
        expect(res.body).toHaveProperty('title', 'Senior Software Engineer');
        expect(res.body).toHaveProperty('description', 'Develop awesome features');
        expect(res.body).toHaveProperty('salary', 150000);

        expect(res.body).toHaveProperty('location');
        const location = res.body.location;
        expect(location).toHaveProperty('formattedAddress', '1 Infinite Loop, Cupertino, CA 95014, USA');
        expect(location).toHaveProperty('placeId', 'ChIJ-3aBaiV2j4ARxBYw-DyWc1I');
        expect(location).toHaveProperty('lat', 37.33182);
        expect(location).toHaveProperty('lng', -122.03118);
    });

    it('should not allow a non-owner (user2) to update the job', async () => {
        const updateJobDto = { title: 'Hacker Update' };

        await request(testBase.getHttpServer())
            .put(`/jobs/${jobId}`)
            .set('Authorization', `Bearer ${user2Token}`)
            .send(updateJobDto)
            .expect(403);
    });

    it('should allow the job owner (user1) to delete the job', async () => {
        const res = await request(testBase.getHttpServer())
            .delete(`/jobs/${jobId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Job removed successfully');
    });

    it('should return 404 when trying to delete a non-existent job', async () => {
        await request(testBase.getHttpServer())
            .delete(`/jobs/${jobId}`)
            .set('Authorization', `Bearer ${user1Token}`)
            .expect(404);
    });

    it('should not allow job deletion without authentication', async () => {
        await request(testBase.getHttpServer())
            .delete(`/jobs/${jobId}`)
            .expect(401);
    });
});
