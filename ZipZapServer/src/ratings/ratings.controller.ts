import { Controller, Post, Body, Param, UseGuards, Request, Put, Delete, Get } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('ratings')
export class RatingsController {
    constructor(private ratingsService: RatingsService) { }

    // Create a new rating for a specific user (ratedUserId is provided in the URL)
    @UseGuards(JwtAuthGuard)
    @Post('/user/:ratedUserId')
    async createRating(
        @Param('ratedUserId') ratedUserId: string,
        @Request() req,
        @Body() createRatingDto: CreateRatingDto,
    ) {
        const raterId = req.user.userId;
        return this.ratingsService.createRating(ratedUserId, raterId, createRatingDto);
    }

    // Update an existing rating (only the rater can update their rating)
    @UseGuards(JwtAuthGuard)
    @Put('/:ratingId')
    async updateRating(
        @Param('ratingId') ratingId: string,
        @Request() req,
        @Body() updateRatingDto: UpdateRatingDto,
    ) {
        const raterId = req.user.userId;
        return this.ratingsService.updateRating(ratingId, raterId, updateRatingDto);
    }

    // Remove an existing rating (only the rater can delete their rating)
    @UseGuards(JwtAuthGuard)
    @Delete('/:ratingId')
    async removeRating(
        @Param('ratingId') ratingId: string,
        @Request() req,
    ) {
        const raterId = req.user.userId;
        return this.ratingsService.removeRating(ratingId, raterId);
    }

    // Retrieve all ratings for a specific user (the rated user)
    @Get('/user/:ratedUserId')
    async getRatingsForUser(@Param('ratedUserId') ratedUserId: string) {
        return this.ratingsService.getRatingsForUser(ratedUserId);
    }
}
