import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './application.schema';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
        JobsModule, // Needed to check job details and ownership.
    ],
    controllers: [ApplicationsController],
    providers: [ApplicationsService],
})
export class ApplicationsModule { }
