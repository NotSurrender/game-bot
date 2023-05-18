import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegrafModule } from 'nestjs-telegraf';
import { GroupsModule } from './groups/groups.module';
import { MembersModule } from './members/members.module';
import { getTeleramConfig } from './configs/telegram.config';
import { AppUpdate } from './app.update';
import { getMongoConfig } from './configs/mongo.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoConfig,
      inject: [ConfigService],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTeleramConfig,
      inject: [ConfigService],
    }),
    GroupsModule,
    MembersModule,
  ],
  providers: [AppUpdate],
})
export class AppModule {}
