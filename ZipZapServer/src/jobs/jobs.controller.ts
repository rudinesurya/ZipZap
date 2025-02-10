import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('jobs')
export class JobsController {
    constructor(private jobsService: JobsService) { }

    // Public endpoint to get all listed jobs.
    @Get()
    async getAllJobs() {
        return this.jobsService.findAll();
    }

    // Create a new job posting. Requires authentication.
    @UseGuards(JwtAuthGuard)
    @Post()
    async createJob(@Request() req, @Body() createJobDto: CreateJobDto) {
        const userId = req.user.userId;
        return this.jobsService.createJob(createJobDto, userId);
    }

    // Update a job posting. Requires authentication.
    @UseGuards(JwtAuthGuard)
    @Put(':jobId')
    async updateJob(
        @Param('jobId') jobId: string,
        @Request() req,
        @Body() updateJobDto: UpdateJobDto,
    ) {
        const userId = req.user.userId;
        return this.jobsService.updateJob(jobId, updateJobDto, userId);
    }

    // Delete a job posting. Requires authentication.
    @UseGuards(JwtAuthGuard)
    @Delete(':jobId')
    async removeJob(@Param('jobId') jobId: string, @Request() req) {
        const userId = req.user.userId;
        return this.jobsService.removeJob(jobId, userId);
    }
}
