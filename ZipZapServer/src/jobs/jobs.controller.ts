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
    @Put(':id')
    async updateJob(
        @Param('id') id: string,
        @Request() req,
        @Body() updateJobDto: UpdateJobDto,
    ) {
        const userId = req.user.userId;
        return this.jobsService.updateJob(id, updateJobDto, userId);
    }

    // Delete a job posting. Requires authentication.
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async removeJob(@Param('id') id: string, @Request() req) {
        const userId = req.user.userId;
        return this.jobsService.removeJob(id, userId);
    }
}
