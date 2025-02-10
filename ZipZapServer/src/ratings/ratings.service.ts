import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
    constructor(
        @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    ) { }

    // Create a new rating for a specific user (ratedUserId) by the authenticated rater (raterId)
    async createRating(
        ratedUserId: string,
        raterId: string,
        createRatingDto: CreateRatingDto,
    ): Promise<Rating> {
        // Check if a rating already exists from this rater for the rated user.
        const existing = await this.ratingModel.findOne({ ratedUser: new Types.ObjectId(ratedUserId), rater: new Types.ObjectId(raterId) }).exec();
        if (existing) {
            throw new ForbiddenException('You have already rated this user. Use the update endpoint to modify your rating.');
        }
        const createdRating = new this.ratingModel({
            ratedUser: new Types.ObjectId(ratedUserId),
            rater: new Types.ObjectId(raterId),
            ...createRatingDto,
        });
        return createdRating.save();
    }

    // Update an existing rating (only allowed if the current user is the one who originally rated)
    async updateRating(
        ratingId: string,
        raterId: string,
        updateRatingDto: UpdateRatingDto,
    ): Promise<Rating> {
        const rating = await this.ratingModel.findById(ratingId).exec();
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        if (rating.rater.toString() !== raterId) {
            throw new ForbiddenException('You can only modify your own rating');
        }
        Object.assign(rating, updateRatingDto);
        return rating.save();
    }

    // Remove an existing rating
    async removeRating(
        ratingId: string,
        raterId: string,
    ): Promise<{ message: string }> {
        const rating = await this.ratingModel.findById(ratingId).exec();
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        if (rating.rater.toString() !== raterId) {
            throw new ForbiddenException('You can only remove your own rating');
        }
        await this.ratingModel.deleteOne({ _id: ratingId });
        return { message: 'Rating removed successfully' };
    }

    // Retrieve all ratings for a given user (the rated user)
    async getRatingsForUser(ratedUserId: string): Promise<Rating[]> {
        return this.ratingModel
            .find({ ratedUser: new Types.ObjectId(ratedUserId) })
            .populate('rater', 'name email') // Populate with rater's basic info
            .exec();
    }
}
