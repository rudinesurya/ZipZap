import * as request from 'supertest';
import { E2ETestBase } from './base.e2e';

describe('Auth Change Password (e2e)', () => {
    let baseTest: E2ETestBase;
    let userToken: string;
    const email = 'john@test.com';

    beforeAll(async () => {
        baseTest = new E2ETestBase();
        await baseTest.setup();

        // Register a user
        const registerRes = await request(baseTest.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'John Doe',
                email,
                password: 'oldpassword',
            })
            .expect(201);
        userToken = registerRes.body.access_token;
    });

    afterAll(async () => {
        await baseTest.teardown();
    });

    it('should allow an authenticated user to change password via /auth/password', async () => {
        const changePasswordDto = {
            currentPassword: 'oldpassword',
            newPassword: 'newpassword123',
        };

        const res = await request(baseTest.getHttpServer())
            .put('/auth/password')
            .set('Authorization', `Bearer ${userToken}`)
            .send(changePasswordDto)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Password updated successfully');

        // Attempt login with the old password should fail.
        await request(baseTest.getHttpServer())
            .post('/auth/login')
            .send({ email, password: 'oldpassword' })
            .expect(401);

        // Login with the new password should succeed.
        const loginResponse = await request(baseTest.getHttpServer())
            .post('/auth/login')
            .send({ email, password: 'newpassword123' })
            .expect(200);
        expect(loginResponse.body).toHaveProperty('access_token');
    });

    it('should return unauthorized if the current password is incorrect during password change', async () => {
        const invalidChange = {
            currentPassword: 'wrongpassword',
            newPassword: 'anotherpassword',
        };

        await request(baseTest.getHttpServer())
            .put('/auth/password')
            .set('Authorization', `Bearer ${userToken}`)
            .send(invalidChange)
            .expect(401);
    });
});
