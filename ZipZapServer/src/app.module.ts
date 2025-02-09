import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RatingsModule } from './ratings/ratings.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://127.0.0.1/zipzap'),
    UsersModule,
    AuthModule,
    RatingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
