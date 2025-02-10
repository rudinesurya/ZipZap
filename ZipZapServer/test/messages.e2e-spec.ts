import * as request from 'supertest';
import { E2ETestBase } from './base.e2e';

describe('Messages Module (e2e)', () => {
    let baseTest: E2ETestBase;
    let senderToken: string;
    let recipientToken: string;
    let senderId: string;
    let recipientId: string;
    let messageId: string;

    beforeAll(async () => {
        baseTest = new E2ETestBase();
        await baseTest.setup();

        // --- Register the sender user ---
        const senderRes = await request(baseTest.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'Sender',
                email: 'sender@example.com',
                password: 'password123',
            })
            .expect(201);
        senderToken = senderRes.body.access_token;

        // Retrieve sender profile to obtain senderId.
        const senderProfileRes = await request(baseTest.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${senderToken}`)
            .expect(200);
        senderId = senderProfileRes.body._id;

        // --- Register the recipient user ---
        const recipientRes = await request(baseTest.getHttpServer())
            .post('/auth/register')
            .send({
                name: 'Recipient',
                email: 'recipient@example.com',
                password: 'password123',
            })
            .expect(201);
        recipientToken = recipientRes.body.access_token;

        // Retrieve recipient profile to obtain recipientId.
        const recipientProfileRes = await request(baseTest.getHttpServer())
            .get('/users/profile')
            .set('Authorization', `Bearer ${recipientToken}`)
            .expect(200);
        recipientId = recipientProfileRes.body._id;
    });

    afterAll(async () => {
        await baseTest.teardown();
    });

    it('should not allow sending a message without authentication', async () => {
        await request(baseTest.getHttpServer())
            .post('/messages')
            .send({
                recipientId,
                content: 'Hello there!',
            })
            .expect(401);
    });

    it('should allow an authenticated user to send a message to another user', async () => {
        const createMessageDto = {
            recipientId: recipientId,
            content: 'Hello, this is a test message!',
        };

        const res = await request(baseTest.getHttpServer())
            .post('/messages')
            .set('Authorization', `Bearer ${senderToken}`)
            .send(createMessageDto)
            .expect(201);

        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('sender');
        expect(res.body).toHaveProperty('recipient');
        expect(res.body).toHaveProperty('content', 'Hello, this is a test message!');
        messageId = res.body._id;
    });

    it('should retrieve the conversation between sender and recipient from the sender perspective', async () => {
        const res = await request(baseTest.getHttpServer())
            .get(`/messages/conversation/${recipientId}`)
            .set('Authorization', `Bearer ${senderToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        // Verify that the message sent earlier appears in the conversation.
        const message = res.body.find((msg) => msg._id === messageId);
        expect(message).toBeDefined();
        expect(message).toHaveProperty('content', 'Hello, this is a test message!');
        expect(message.sender).toHaveProperty('name', 'Sender');
        expect(message.recipient).toHaveProperty('name', 'Recipient');
    });

    it('should retrieve the conversation from the recipient perspective', async () => {
        const res = await request(baseTest.getHttpServer())
            .get(`/messages/conversation/${senderId}`)
            .set('Authorization', `Bearer ${recipientToken}`)
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        const message = res.body.find((msg) => msg._id === messageId);
        expect(message).toBeDefined();
        expect(message).toHaveProperty('content', 'Hello, this is a test message!');
        expect(message.sender).toHaveProperty('name', 'Sender');
        expect(message.recipient).toHaveProperty('name', 'Recipient');
    });

    it('should not allow retrieving conversation without authentication', async () => {
        await request(baseTest.getHttpServer())
            .get(`/messages/conversation/${recipientId}`)
            .expect(401);
    });
});
