import * as request from 'supertest';
import { E2ETestBase } from './base.e2e';

describe('Applications Module (e2e)', () => {
    let baseTest: E2ETestBase;
    let jobPosterToken: string;
    let applicantToken: string;
    let jobPosterId: string;
    let applicantId: string;
    let jobId: string;

    beforeAll(async () => {
        baseTest = new E2ETestBase();
        await baseTest.setup();

        // --- Register job poster ---
        const jobPosterRes = await request(baseTest.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'Job Poster',
                email: 'poster@test.com',
                password: 'password123',
            })
            .expect(201);
        jobPosterToken = jobPosterRes.body.access_token;

        // Retrieve job poster profile.
        const jobPosterProfile = await request(baseTest.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${jobPosterToken}`)
            .expect(200);
        jobPosterId = jobPosterProfile.body._id;

        // --- Register applicant ---
        const applicantRes = await request(baseTest.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'Applicant',
                email: 'applicant@test.com',
                password: 'password123',
            })
            .expect(201);
        applicantToken = applicantRes.body.access_token;

        // Retrieve applicant profile.
        const applicantProfile = await request(baseTest.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${applicantToken}`)
            .expect(200);
        applicantId = applicantProfile.body._id;

        // --- Create a job posting by the job poster ---
        const jobRes = await request(baseTest.getHttpServer())
            .post('/jobs')
            .set('Authorization', `Bearer ${jobPosterToken}`)
            .send({
                title: 'Test Job',
                description: 'Job Description',
                location: 'Remote',
                salary: 100000,
            })
            .expect(201);
        jobId = jobRes.body._id;
    });

    afterAll(async () => {
        await baseTest.teardown();
    });

    it('should allow an authenticated user (applicant) to apply to a job', async () => {
        const createApplicationDto = {
            jobId: jobId,
            coverLetter: 'I am interested in this job.',
        };

        const res = await request(baseTest.getHttpServer())
            .post('/applications')
            .set('Authorization', `Bearer ${applicantToken}`)
            .send(createApplicationDto)
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('job', jobId);
        expect(res.body).toHaveProperty('coverLetter', 'I am interested in this job.');
        expect(res.body).toHaveProperty('applicant');
    });

    it('should not allow the same applicant to apply to the same job twice', async () => {
        const createApplicationDto = {
            jobId: jobId,
            coverLetter: 'Second application attempt.',
        };

        await request(baseTest.getHttpServer())
            .post('/applications')
            .set('Authorization', `Bearer ${applicantToken}`)
            .send(createApplicationDto)
            .expect(400);
    });

    it('should allow the job poster to retrieve the list of applicants for their job', async () => {
        const res = await request(baseTest.getHttpServer())
            .get(`/applications/job/${jobId}`)
            .set('Authorization', `Bearer ${jobPosterToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        const application = res.body[0];
        expect(application).toHaveProperty('applicant');
        expect(application.applicant).toHaveProperty('name', 'Applicant');
        expect(application.applicant).toHaveProperty('email', 'applicant@test.com');
    });

    it('should not allow a non-owner (applicant) to retrieve the full list of applicants', async () => {
        await request(baseTest.getHttpServer())
            .get(`/applications/job/${jobId}`)
            .set('Authorization', `Bearer ${applicantToken}`)
            .expect(403);
    });

    it('should allow any user to retrieve the application count for a job', async () => {
        const res = await request(baseTest.getHttpServer())
            .get(`/applications/job/${jobId}/count`)
            .expect(200);

        expect(res.body).toHaveProperty('count', 1);
    });
});
