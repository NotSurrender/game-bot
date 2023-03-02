import { TelegrafModule } from 'nestjs-telegraf';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypegooseModule } from 'nestjs-typegoose';
import { getMongoConfig } from './configs/mongo.config';
import { GroupModule } from './group/group.module';
import { MemberModule } from './member/member.module';
import { getTeleramConfig } from './configs/telegram.config';
import { AppUpdate } from './app.update';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTeleramConfig,
      inject: [ConfigService],
    }),
    TypegooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    GroupModule,
    MemberModule,
  ],
  providers: [AppUpdate],
})
export class AppModule {}
