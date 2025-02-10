import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
    constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) { }

    // Return all jobs (public endpoint)
    async findAll(): Promise<Job[]> {
        return this.jobModel.find().exec();
    }

    // Return a single job by its ID
    async findById(jobId: string): Promise<Job> {
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with id ${jobId} not found`);
        }
        return job;
    }

    // Create a new job posting
    async createJob(createJobDto: CreateJobDto, userId: string): Promise<Job> {
        const newJob = new this.jobModel({
            ...createJobDto,
            postedBy: new Types.ObjectId(userId),
        });
        return newJob.save();
    }

    // Update an existing job (only if the current user is the one who posted it)
    async updateJob(jobId: string, updateJobDto: UpdateJobDto, userId: string): Promise<Job> {
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with id ${jobId} not found`);
        }
        if (job.postedBy.toString() !== userId) {
            throw new ForbiddenException(`You are not allowed to update this job`);
        }
        Object.assign(job, updateJobDto);
        return job.save();
    }

    // Remove a job posting (only if the current user is the one who posted it)
    async removeJob(jobId: string, userId: string): Promise<{ message: string }> {
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with id ${jobId} not found`);
        }
        if (job.postedBy.toString() !== userId) {
            throw new ForbiddenException(`You are not allowed to delete this job`);
        }
        await this.jobModel.deleteOne({ _id: jobId });
        return { message: 'Job removed successfully' };
    }
}
