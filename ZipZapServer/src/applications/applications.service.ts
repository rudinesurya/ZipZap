import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class ApplicationsService {
    constructor(
        @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
        private jobsService: JobsService,
    ) { }

    async applyToJob(createApplicationDto: CreateApplicationDto, applicantId: string): Promise<Application> {
        // Ensure the job exists.
        const job = await this.jobsService.findById(createApplicationDto.jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        // Check if the applicant already applied.
        const existing = await this.applicationModel.findOne({
            job: new Types.ObjectId(createApplicationDto.jobId),
            applicant: new Types.ObjectId(applicantId),
        }).exec();

        if (existing) {
            throw new BadRequestException('You have already applied for this job');
        }

        const application = new this.applicationModel({
            job: new Types.ObjectId(createApplicationDto.jobId),
            applicant: new Types.ObjectId(applicantId),
            coverLetter: createApplicationDto.coverLetter,
        });
        return application.save();
    }

    async getApplicationsForJob(jobId: string, requesterId: string): Promise<Application[]> {
        // Verify the job exists.
        const job = await this.jobsService.findById(jobId);
        if (!job) {
            throw new NotFoundException('Job not found');
        }
        // Only the job poster can view full applicant details.
        if (job.postedBy.toString() !== requesterId) {
            throw new ForbiddenException('Only the job poster can view the applicants');
        }
        return this.applicationModel.find({ job: new Types.ObjectId(jobId) })
            .populate('applicant', 'name email handle')
            .exec();
    }

    async getApplicationCountForJob(jobId: string): Promise<number> {
        return this.applicationModel.countDocuments({ job: new Types.ObjectId(jobId) });
    }
}
