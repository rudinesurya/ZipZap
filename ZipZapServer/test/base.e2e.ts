import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

export class E2ETestBase {
    public app: INestApplication;
    public mongod: MongoMemoryServer;

    /**
     * Initializes the NestJS application and the in-memory MongoDB instance.
     */
    async setup() {
        // Start an in-memory MongoDB instance
        this.mongod = await MongoMemoryServer.create();
        process.env.MONGO_URI = this.mongod.getUri();

        // Explicitly connect before initializing the NestJS app
        await mongoose.connect(process.env.MONGO_URI, {});

        // Create and initialize the NestJS application
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        this.app = moduleFixture.createNestApplication();
        // Enable global validation (for DTOs)
        this.app.useGlobalPipes(new ValidationPipe());
        await this.app.init();

        // Ensure the in-memory database is clean before tests run
        await mongoose.connection.dropDatabase();
    }

    /**
     * Returns the HTTP server instance for Supertest.
     */
    getHttpServer() {
        return this.app.getHttpServer();
    }

    /**
     * Tears down the NestJS application and stops the in-memory MongoDB instance.
     */
    async teardown() {
        await mongoose.connection.close();
        await this.app.close();
        await this.mongod.stop();
    }
}
