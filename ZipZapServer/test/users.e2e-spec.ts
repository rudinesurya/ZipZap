import * as request from 'supertest';
import { E2ETestBase } from './base.e2e';

describe('Users Module (e2e)', () => {
    let testBase: E2ETestBase;
    let userToken: string;
    let userId: string; // We'll extract this from the profile response

    beforeAll(async () => {
        testBase = new E2ETestBase();
        await testBase.setup();

        // Register a user for testing.
        const registerResponse = await request(testBase.getHttpServer())
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
        const profileResponse = await request(testBase.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(profileResponse.body).toHaveProperty('_id');
        userId = profileResponse.body._id;
    });

    afterAll(async () => {
        await testBase.teardown();
    });

    it('should retrieve the authenticated user profile', async () => {
        const res = await request(testBase.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        // Verify that the returned profile has the expected properties.
        expect(res.body).toHaveProperty('_id', userId);
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
        expect(res.body).toHaveProperty('name', 'Test User');
    });

    it('should retrieve the authenticated user settings', async () => {
        const res = await request(testBase.getHttpServer())
            .get('/users/settings')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        // Verify that the returned profile has the expected properties.
        expect(res.body).toHaveProperty('_id', userId);
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
        expect(res.body).toHaveProperty('name', 'Test User');
    });

    it('should update user profile using PUT /users/profile', async () => {
        // Prepare new profile to update (for example, updating the name).
        const updateProfileDto = { name: 'Updated Test User' };

        const res = await request(testBase.getHttpServer())
            .put('/users/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateProfileDto)
            .expect(200);

        // Verify that the updated profile reflects the new profile.
        expect(res.body).toHaveProperty('_id', userId);
        expect(res.body).toHaveProperty('name', 'Updated Test User');
        // The email should remain unchanged.
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
    });

    it('should update user settings using PUT /users/settings', async () => {
        // Prepare new settings to update (for example, updating the theme).
        const updateSettingsDto = { theme: 'new theme' };

        const res = await request(testBase.getHttpServer())
            .put('/users/settings')
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateSettingsDto)
            .expect(200);

        // Verify that the updated profile reflects the new settings.
        expect(res.body).toHaveProperty('_id', userId);
        expect(res.body).toHaveProperty('theme', 'new theme');
        // The email should remain unchanged.
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
    });

    it('should deny access to profile without token', async () => {
        await request(testBase.getHttpServer())
            .get('/users/profile')
            .expect(401);
    });

    it('should deny updating settings without token', async () => {
        await request(testBase.getHttpServer())
            .put('/users/settings')
            .send({ theme: 'new theme' })
            .expect(401);
    });
});
