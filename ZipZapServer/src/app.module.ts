import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RatingsModule } from './ratings/ratings.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        // console.log('MONGO_URI from process.env:', process.env.MONGO_URI);
        return {
          uri: process.env.MONGO_URI,
        };
      },
    }),
    UsersModule,
    AuthModule,
    RatingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
