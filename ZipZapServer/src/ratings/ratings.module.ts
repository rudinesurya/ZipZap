import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './rating.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),
    ],
    providers: [RatingsService],
    controllers: [RatingsController],
    exports: [RatingsService],
})
export class RatingsModule { }
