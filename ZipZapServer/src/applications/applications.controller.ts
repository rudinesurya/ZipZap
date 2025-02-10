import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('applications')
export class ApplicationsController {
    constructor(private applicationsService: ApplicationsService) { }

    // Apply for a job.
    @UseGuards(JwtAuthGuard)
    @Post()
    async apply(@Request() req, @Body() createApplicationDto: CreateApplicationDto) {
        const applicantId = req.user.userId;
        return this.applicationsService.applyToJob(createApplicationDto, applicantId);
    }

    // Job poster retrieves full list of applicants.
    @UseGuards(JwtAuthGuard)
    @Get('job/:jobId')
    async getApplications(@Param('jobId') jobId: string, @Request() req) {
        const requesterId = req.user.userId;
        return this.applicationsService.getApplicationsForJob(jobId, requesterId);
    }

    // Retrieve count of applications for a job.
    @Get('job/:jobId/count')
    async getApplicationCount(@Param('jobId') jobId: string) {
        const count = await this.applicationsService.getApplicationCountForJob(jobId);
        return { count };
    }
}
